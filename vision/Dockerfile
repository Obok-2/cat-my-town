# 고양이 영역 추출 서버. ARM64(백엔드 서버)·x86 모두 CPU로 동작한다(GPU 불필요).
FROM python:3.12-slim

# OpenCV(ultralytics 의존성)가 쓰는 시스템 라이브러리
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
# CPU 전용 PyTorch를 먼저 설치해 GPU용(수 GB) 패키지를 받지 않는다
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt
COPY main.py .

# 모델 가중치는 /models 에 내려받아 볼륨으로 보관한다(재시작 때 다시 받지 않도록)
WORKDIR /models
ENV YOLO_CONFIG_DIR=/models/.ultralytics
EXPOSE 8000
CMD ["uvicorn", "main:app", "--app-dir", "/app", "--host", "0.0.0.0", "--port", "8000"]
