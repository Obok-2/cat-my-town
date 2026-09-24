package com.catmytown.server.app.camera;

// vision 서버(/analyze)의 판별 결과. 고양이면 croppedImage에 고양이 네모로 잘라낸 JPEG가 들어 있다.
public class VisionResult {

    private final boolean cat;

    private final String label;

    private final double confidence;

    private final byte[] croppedImage;

    public VisionResult(boolean cat, String label, double confidence, byte[] croppedImage) {
        this.cat = cat;
        this.label = label;
        this.confidence = confidence;
        this.croppedImage = croppedImage;
    }

    public boolean isCat() {
        return cat;
    }

    public String getLabel() {
        return label;
    }

    public double getConfidence() {
        return confidence;
    }

    public byte[] getCroppedImage() {
        return croppedImage;
    }

}
