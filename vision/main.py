"""고양이 영역 추출 서버 (FastAPI + YOLO-seg)

사진 1장을 받아 고양이를 찾고, 고양이 윤곽만 남긴 채 배경을 단색으로 채운 뒤 고양이 영역으로 잘라 돌려준다.
Spring 서버가 이 이미지로 임베딩을 만들어, 배경이 비슷해서 다른 고양이를 같은 고양이로 판단하는 문제를 줄인다.

- 모델은 COCO로 학습된 공개 모델을 그대로 쓴다(학습 없음). 서버 시작 시 한 번 불러 두고, 가중치가 없으면 자동으로 내려받는다.
- 잘라낸 이미지는 응답으로만 돌려주고 저장하지 않는다(원본은 Spring이 MinIO에 저장).
- 내부 전용 서버라 외부 포트를 열지 않고 Spring만 호출한다.
"""

import base64
import io
import logging
import os

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
from ultralytics import YOLO

MODEL_NAME = os.getenv("YOLO_MODEL", "yolo11n-seg.pt")
# 이 확률 이상인 "cat" 탐지만 고양이로 본다(테스트 세트로 조정)
CAT_MIN_CONFIDENCE = float(os.getenv("CAT_MIN_CONFIDENCE", "0.25"))
# 잘라낼 때 고양이 네모 바깥으로 남기는 여백(네모 크기 대비 비율)
CROP_PADDING = float(os.getenv("CROP_PADDING", "0.08"))
# 배경을 채울 색(중간 회색). 흰색·검은색보다 털 색과 덜 섞인다
BACKGROUND_COLOR = (127, 127, 127)
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
JPEG_QUALITY = 90

log = logging.getLogger("vision")
app = FastAPI(title="cat-my-town vision", version="0.1.0")

model = YOLO(MODEL_NAME)
CAT_CLASS_ID = next(class_id for class_id, name in model.names.items() if name == "cat")


@app.get("/health")
def health():
    return {"status": "UP", "model": MODEL_NAME}


@app.post("/analyze")
async def analyze(photo: UploadFile = File(...)):
    data = await photo.read()
    if not data:
        raise HTTPException(status_code=400, detail="사진 파일이 필요합니다.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="사진이 너무 큽니다.")

    image = read_image(data)
    pixels = np.asarray(image)
    result = model.predict(pixels, retina_masks=True, verbose=False)[0]

    best_index = pick_cat(result, image.width, image.height)
    if best_index is None:
        label, confidence = top_detection(result)
        return {"isCat": False, "label": label, "confidence": confidence}

    box = result.boxes.xyxy[best_index].tolist()
    confidence = float(result.boxes.conf[best_index])
    mask = result.masks.data[best_index].cpu().numpy() > 0.5 if result.masks is not None else None

    cat_image = cut_out_cat(pixels, mask, box)
    return {
        "isCat": True,
        "label": "cat",
        "confidence": round(confidence, 4),
        "box": normalized_box(box, image.width, image.height),
        "image": encode_jpeg(cat_image),
    }


def read_image(data: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(data))
        # 휴대폰 사진의 회전 정보(EXIF)를 실제 픽셀에 반영해야 박스 좌표가 앱 화면과 맞는다
        return ImageOps.exif_transpose(image).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="올바른 이미지 파일이 아닙니다.")


def pick_cat(result, width: int, height: int):
    """고양이가 여러 마리면 확률 × 면적이 가장 큰 한 마리를 고른다(가장 확실하고 크게 찍힌 고양이)."""
    best_index = None
    best_score = 0.0
    image_area = float(width * height)
    for index in range(len(result.boxes)):
        if int(result.boxes.cls[index]) != CAT_CLASS_ID:
            continue
        confidence = float(result.boxes.conf[index])
        if confidence < CAT_MIN_CONFIDENCE:
            continue
        x1, y1, x2, y2 = result.boxes.xyxy[index].tolist()
        score = confidence * ((x2 - x1) * (y2 - y1) / image_area)
        if score > best_score:
            best_score = score
            best_index = index
    return best_index


def top_detection(result):
    """고양이가 없을 때 앱에 참고로 보여줄, 가장 확실하게 찾은 물체 이름과 확률."""
    if len(result.boxes) == 0:
        return "none", 0.0
    index = int(result.boxes.conf.argmax())
    return result.names[int(result.boxes.cls[index])], round(float(result.boxes.conf[index]), 4)


def cut_out_cat(pixels: np.ndarray, mask, box) -> np.ndarray:
    """마스크 밖(배경)을 단색으로 채우고, 고양이 네모에 여백을 조금 둬서 잘라낸다."""
    height, width = pixels.shape[:2]
    output = pixels.copy()
    if mask is not None and mask.shape == (height, width):
        output[~mask] = BACKGROUND_COLOR

    x1, y1, x2, y2 = box
    pad_x = (x2 - x1) * CROP_PADDING
    pad_y = (y2 - y1) * CROP_PADDING
    left = max(0, int(x1 - pad_x))
    top = max(0, int(y1 - pad_y))
    right = min(width, int(x2 + pad_x))
    bottom = min(height, int(y2 + pad_y))
    return output[top:bottom, left:right]


def normalized_box(box, width: int, height: int) -> dict:
    """사진 크기가 달라도 쓸 수 있게 0~1 비율로 돌려준다(DB 저장용)."""
    x1, y1, x2, y2 = box
    return {
        "x": round(x1 / width, 4),
        "y": round(y1 / height, 4),
        "w": round((x2 - x1) / width, 4),
        "h": round((y2 - y1) / height, 4),
    }


def encode_jpeg(pixels: np.ndarray) -> str:
    buffer = io.BytesIO()
    Image.fromarray(pixels).save(buffer, format="JPEG", quality=JPEG_QUALITY)
    return base64.b64encode(buffer.getvalue()).decode("ascii")
