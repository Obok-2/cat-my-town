# vision — 고양이 판별·임베딩 서버

사진에서 고양이를 찾아 **네모로 자르고, 같은 고양이인지 비교할 수 있는 숫자 목록(임베딩)으로 바꿔** 돌려주는 내부 전용 서버입니다(FastAPI).
배경 설명과 모델 선택 이유는 [`docs/매칭_정확도_개선_계획.md`](../docs/매칭_정확도_개선_계획.md).

| 역할 | 모델 | 라이선스(Hugging Face 표시) |
|---|---|---|
| 고양이 찾기 | RT-DETR v2 `PekingU/rtdetr_v2_r18vd` (COCO) | Apache 2.0 |
| 임베딩 | DINOv2 `facebook/dinov2-small` (384차원) | Apache 2.0 |

## API

### `GET /health`
`{ "status": "UP", "detector": "PekingU/rtdetr_v2_r18vd", "embedder": "facebook/dinov2-small" }`

### `POST /analyze` (multipart, 필드 이름 `photo`)
- 고양이 없음
  ```json
  { "isCat": false, "label": "dog", "confidence": 0.91 }
  ```
- 고양이 있음 (여러 마리면 확률 × 면적이 가장 큰 한 마리)
  ```json
  {
    "isCat": true,
    "label": "cat",
    "confidence": 0.9312,
    "box": { "x": 0.2104, "y": 0.3381, "w": 0.4012, "h": 0.5227 },
    "image": "<고양이 네모로 잘라낸 JPEG, base64>",
    "embedding": [0.0123, -0.0456, "... 384개"]
  }
  ```
  `box`는 사진 크기 대비 0~1 비율(왼쪽 위 기준)입니다. `embedding`은 길이 1로 정규화돼 있어서 두 벡터의 내적이 곧 코사인 유사도입니다.
- 오류: 빈 파일·이미지가 아님 `400`, 10MB 초과 `413`

임베딩 차원은 `EMBEDDER_MODEL`에 따라 달라집니다(small 384, base 768). 모델을 바꾸면 DB 벡터 컬럼 차원과 기존 임베딩도 함께 바꿔야 합니다.

## 설정 (환경변수)

| 이름 | 기본값 | 설명 |
|---|---|---|
| `DETECTOR_MODEL` | `PekingU/rtdetr_v2_r18vd` | 고양이를 찾는 Hugging Face 모델. 더 정확한 것은 `PekingU/rtdetr_v2_r50vd` |
| `EMBEDDER_MODEL` | `facebook/dinov2-small` | 임베딩 모델. 더 큰 것은 `facebook/dinov2-base` |
| `CAT_MIN_CONFIDENCE` | `0.3` | 이 확률 이상인 "cat"만 고양이로 봄 |
| `CROP_PADDING` | `0.08` | 잘라낼 때 고양이 네모 바깥 여백 비율 |

모델을 바꾸기 전에 Hugging Face 모델 카드의 라이선스를 확인하세요. 첫 실행 때 가중치를 자동으로 내려받습니다.

## 실행

**Docker (서버)**
```bash
docker build -t cat-my-town-vision ./vision
docker run -d --name cat-my-town-vision -v /home/rocky/my_cat_project/vision_models:/models cat-my-town-vision
```

**docker compose에 추가할 때** (외부 포트는 열지 않고 Spring만 `http://vision:8000`으로 호출)
```yaml
  vision:
    build: ./vision
    container_name: cat-my-town-vision
    restart: unless-stopped
    volumes:
      - /home/rocky/my_cat_project/vision_models:/models
```

**로컬 (Python 3.12)**
```bash
cd vision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
uvicorn main:app --port 8000
```
