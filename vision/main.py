"""고양이 판별·임베딩 서버 (FastAPI + RT-DETR + DINOv2)

사진 1장을 받아 고양이를 찾고, 고양이 네모로 잘라서 같은 고양이인지 비교할 수 있는 숫자 목록(임베딩)으로 바꿔 돌려준다.

- 탐지: RT-DETR v2(Apache 2.0, COCO 학습). 고양이 여러 마리면 확률 × 면적이 가장 큰 한 마리만 쓴다.
- 임베딩: DINOv2(Apache 2.0). 잘라낸 고양이를 정사각형으로 맞춘 뒤 CLS 벡터를 길이 1로 정규화해서 돌려준다.
- 모델은 공개된 학습 결과를 그대로 쓴다(학습 없음). 서버 시작 시 한 번 불러 두고, 가중치가 없으면 자동으로 내려받는다.
- 잘라낸 이미지는 응답으로만 돌려주고 저장하지 않는다(원본은 Spring이 MinIO에 저장).
- 내부 전용 서버라 외부 포트를 열지 않고 Spring만 호출한다.
"""

import base64
import io
import logging
import os

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
from transformers import AutoImageProcessor, AutoModel, AutoModelForObjectDetection

DETECTOR_MODEL = os.getenv("DETECTOR_MODEL", "PekingU/rtdetr_v2_r18vd")
EMBEDDER_MODEL = os.getenv("EMBEDDER_MODEL", "facebook/dinov2-small")
# 이 확률 이상인 "cat" 탐지만 고양이로 본다(테스트 세트로 조정)
CAT_MIN_CONFIDENCE = float(os.getenv("CAT_MIN_CONFIDENCE", "0.3"))
# 잘라낼 때 고양이 네모 바깥으로 남기는 여백(네모 크기 대비 비율)
CROP_PADDING = float(os.getenv("CROP_PADDING", "0.08"))
# 임베딩 입력 크기. 잘라낸 고양이를 이 크기의 정사각형으로 맞춰 넣는다
EMBED_INPUT_SIZE = 224
# 정사각형으로 맞출 때 빈 곳을 채울 색(중간 회색)
PAD_COLOR = (127, 127, 127)
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
JPEG_QUALITY = 90

log = logging.getLogger("vision")
app = FastAPI(title="cat-my-town vision", version="0.2.0")

detector_processor = AutoImageProcessor.from_pretrained(DETECTOR_MODEL)
detector = AutoModelForObjectDetection.from_pretrained(DETECTOR_MODEL).eval()
embedder_processor = AutoImageProcessor.from_pretrained(EMBEDDER_MODEL)
embedder = AutoModel.from_pretrained(EMBEDDER_MODEL).eval()
CAT_LABEL_ID = next(label_id for label_id, name in detector.config.id2label.items() if name == "cat")


@app.get("/health")
def health():
    return {"status": "UP", "detector": DETECTOR_MODEL, "embedder": EMBEDDER_MODEL}


# 모델 계산이 오래 걸려서 async가 아닌 일반 함수로 둔다(FastAPI가 스레드풀에서 실행해 /health 등이 막히지 않는다)
@app.post("/analyze")
def analyze(photo: UploadFile = File(...)):
    data = photo.file.read()
    if not data:
        raise HTTPException(status_code=400, detail="사진 파일이 필요합니다.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="사진이 너무 큽니다.")

    image = read_image(data)
    detections = detect(image)

    best = pick_cat(detections, image.width, image.height)
    if best is None:
        label, confidence = top_detection(detections)
        return {"isCat": False, "label": label, "confidence": confidence}

    cat_image = crop_cat(image, best["box"])
    return {
        "isCat": True,
        "label": "cat",
        "confidence": round(best["score"], 4),
        "box": normalized_box(best["box"], image.width, image.height),
        "image": encode_jpeg(cat_image),
        "embedding": embed(cat_image),
    }


def read_image(data: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(data))
        # 휴대폰 사진의 회전 정보(EXIF)를 실제 픽셀에 반영해야 박스 좌표가 앱 화면과 맞는다
        return ImageOps.exif_transpose(image).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="올바른 이미지 파일이 아닙니다.")


def detect(image: Image.Image) -> list:
    """사진에서 찾은 모든 물체를 [{label, score, box(왼쪽위·오른쪽아래 픽셀 좌표)}]로 돌려준다."""
    inputs = detector_processor(images=image, return_tensors="pt")
    with torch.inference_mode():
        outputs = detector(**inputs)
    results = detector_processor.post_process_object_detection(
        outputs, target_sizes=torch.tensor([[image.height, image.width]]), threshold=0.0
    )[0]

    detections = []
    for score, label_id, box in zip(results["scores"], results["labels"], results["boxes"]):
        detections.append(
            {
                "label_id": int(label_id),
                "label": detector.config.id2label[int(label_id)],
                "score": float(score),
                "box": box.tolist(),
            }
        )
    return detections


def pick_cat(detections: list, width: int, height: int):
    """고양이가 여러 마리면 확률 × 면적이 가장 큰 한 마리를 고른다(가장 확실하고 크게 찍힌 고양이)."""
    best = None
    best_score = 0.0
    image_area = float(width * height)
    for detection in detections:
        if detection["label_id"] != CAT_LABEL_ID or detection["score"] < CAT_MIN_CONFIDENCE:
            continue
        x1, y1, x2, y2 = detection["box"]
        score = detection["score"] * (max(0.0, x2 - x1) * max(0.0, y2 - y1) / image_area)
        if score > best_score:
            best_score = score
            best = detection
    return best


def top_detection(detections: list):
    """고양이가 없을 때 앱에 참고로 보여줄, 가장 확실하게 찾은 물체 이름과 확률."""
    if not detections:
        return "none", 0.0
    top = max(detections, key=lambda detection: detection["score"])
    return top["label"], round(top["score"], 4)


def crop_cat(image: Image.Image, box) -> Image.Image:
    """고양이 네모에 여백을 조금 둬서 잘라낸다(배경은 지우지 않는다)."""
    x1, y1, x2, y2 = box
    pad_x = (x2 - x1) * CROP_PADDING
    pad_y = (y2 - y1) * CROP_PADDING
    left = max(0, int(x1 - pad_x))
    top = max(0, int(y1 - pad_y))
    right = min(image.width, int(x2 + pad_x))
    bottom = min(image.height, int(y2 + pad_y))
    return image.crop((left, top, right, bottom))


def embed(cat_image: Image.Image) -> list:
    """잘라낸 고양이를 임베딩(길이 1로 정규화한 숫자 목록)으로 바꾼다. 같은 고양이일수록 값이 가깝다."""
    square = to_square(cat_image)
    # 이미 정사각형이라 가운데 자르기는 하지 않는다(고양이 가장자리가 잘리지 않게)
    inputs = embedder_processor(
        images=square, return_tensors="pt", size={"shortest_edge": EMBED_INPUT_SIZE}, do_center_crop=False
    )
    with torch.inference_mode():
        vector = embedder(**inputs).pooler_output[0]
    vector = vector / vector.norm()
    return [round(value, 6) for value in vector.tolist()]


def to_square(image: Image.Image) -> Image.Image:
    """비율을 그대로 두고 긴 변에 맞춰 정사각형으로 만든다(빈 곳은 회색). 늘리면 무늬 모양이 변한다."""
    side = max(image.width, image.height)
    square = Image.new("RGB", (side, side), PAD_COLOR)
    square.paste(image, ((side - image.width) // 2, (side - image.height) // 2))
    return square


def normalized_box(box, width: int, height: int) -> dict:
    """사진 크기가 달라도 쓸 수 있게 0~1 비율로 돌려준다(DB 저장용)."""
    x1, y1, x2, y2 = box
    x1, y1 = max(0.0, x1), max(0.0, y1)
    x2, y2 = min(float(width), x2), min(float(height), y2)
    return {
        "x": round(x1 / width, 4),
        "y": round(y1 / height, 4),
        "w": round((x2 - x1) / width, 4),
        "h": round((y2 - y1) / height, 4),
    }


def encode_jpeg(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=JPEG_QUALITY)
    return base64.b64encode(buffer.getvalue()).decode("ascii")
