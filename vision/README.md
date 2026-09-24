# vision — 고양이 영역 추출 서버

사진에서 고양이를 찾아 **배경을 지우고 고양이 영역만 잘라** 돌려주는 내부 전용 서버입니다(FastAPI + YOLO-seg).
Spring 서버가 이 이미지로 임베딩을 만들어 매칭 정확도를 높입니다. 배경 설명은 [`docs/매칭_정확도_개선_계획.md`](../docs/매칭_정확도_개선_계획.md).

## API

### `GET /health`
`{ "status": "UP", "model": "yolo11n-seg.pt" }`

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
    "image": "<배경을 회색으로 채우고 잘라낸 JPEG, base64>"
  }
  ```
  `box`는 사진 크기 대비 0~1 비율(왼쪽 위 기준)입니다.
- 오류: 빈 파일·이미지가 아님 `400`, 10MB 초과 `413`

## 설정 (환경변수)

| 이름 | 기본값 | 설명 |
|---|---|---|
| `YOLO_MODEL` | `yolo11n-seg.pt` | 사용할 YOLO 분할 모델. 없으면 첫 실행 때 자동으로 내려받음 |
| `CAT_MIN_CONFIDENCE` | `0.25` | 이 확률 이상인 "cat"만 고양이로 봄 |
| `CROP_PADDING` | `0.08` | 잘라낼 때 고양이 네모 바깥 여백 비율 |

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

## 라이선스 참고
Ultralytics YOLO는 AGPL-3.0입니다. 공개 저장소·포트폴리오에는 문제없지만, 상업 서비스로 전환하면
소스 공개 의무 또는 유료 라이선스가 필요합니다(대안: RT-DETR, YOLOX 등 Apache 2.0 모델).
