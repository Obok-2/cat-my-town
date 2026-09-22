package com.catmytown.server.app.camera;

import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.CameraAnalysisRes;
import com.catmytown.server.model.CameraAnalysisStatus;
import com.catmytown.server.model.CameraCandidateRes;
import com.catmytown.server.model.CameraCandidateVo;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CameraService {

    @Autowired
    private CameraDao cameraDao;

    @Autowired
    private CatImageClassifier catImageClassifier;

    @Autowired
    private VoyageImageEmbeddingClient voyageImageEmbeddingClient;

    @Value("${camera.match.threshold}")
    private double matchThreshold;

    @Value("${camera.match.lower-bound}")
    private double lowerBound;

    @Value("${camera.match.upper-bound}")
    private double upperBound;

    @Value("${camera.match.max-candidates}")
    private int maxCandidates;

    public ResponseApi analyze(MultipartFile photo, Long userId) {
        validatePhoto(photo);

        byte[] photoBytes;
        try {
            photoBytes = photo.getBytes();
        } catch (IOException e) {
            throw new BusinessException(400, "사진을 읽을 수 없습니다.");
        }

        CatDetectionResult detection = catImageClassifier.classify(photoBytes);
        if (!detection.isCat()) {
            return ResponseApi.success(CameraAnalysisRes.notCat(
                    detection.getLabel(), toPercent(detection.getCatProbability())));
        }

        int catCount = cameraDao.selectCatCount(userId);
        if (catCount == 0) {
            return ResponseApi.success(CameraAnalysisRes.newCat(
                    detection.getLabel(), toPercent(detection.getCatProbability())));
        }
        if (cameraDao.selectEmbeddedCatCount(userId) != catCount) {
            throw new BusinessException(503, "등록된 고양이의 비교 데이터가 준비되지 않았습니다.");
        }

        List<Double> embedding = voyageImageEmbeddingClient.createQueryEmbedding(photoBytes, photo.getContentType());
        double minimumSimilarity = lowerBound + matchThreshold / 100.0 * (upperBound - lowerBound);
        List<CameraCandidateVo> matched = cameraDao.selectMatchingCandidates(
                userId, toVectorLiteral(embedding), minimumSimilarity, maxCandidates);

        if (matched.isEmpty()) {
            return ResponseApi.success(CameraAnalysisRes.newCat(
                    detection.getLabel(), toPercent(detection.getCatProbability())));
        }

        List<CameraCandidateRes> candidates = new ArrayList<>();
        for (CameraCandidateVo item : matched) {
            CameraCandidateRes candidate = new CameraCandidateRes();
            candidate.setCatId(item.getCatId());
            candidate.setName(item.getName());
            candidate.setPhotoUrl(item.getPhotoUrl());
            candidate.setSightingCount(item.getSightingCount());
            candidate.setScore(calibrate(item.getRawSimilarity()));
            candidate.setTags(cameraDao.selectCatTags(item.getCatId()));
            candidates.add(candidate);
        }

        CameraAnalysisRes response = new CameraAnalysisRes();
        response.setStatus(CameraAnalysisStatus.EXISTING_CAT);
        response.setCat(true);
        response.setDetectedLabel(detection.getLabel());
        response.setCatProbability(toPercent(detection.getCatProbability()));
        response.setCandidates(candidates);
        return ResponseApi.success(response);
    }

    private void validatePhoto(MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            throw new BusinessException(400, "사진 파일이 필요합니다.");
        }
        String contentType = photo.getContentType();
        if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
            throw new BusinessException(400, "JPEG 또는 PNG 사진만 사용할 수 있습니다.");
        }
    }

    private double calibrate(double rawSimilarity) {
        if (upperBound <= lowerBound) {
            throw new IllegalStateException("고양이 매칭 보정 범위가 올바르지 않습니다.");
        }
        double score = (rawSimilarity - lowerBound) / (upperBound - lowerBound) * 100.0;
        return Math.round(Math.max(0, Math.min(100, score)) * 10.0) / 10.0;
    }

    private double toPercent(double probability) {
        return Math.round(probability * 1000.0) / 10.0;
    }

    private String toVectorLiteral(List<Double> embedding) {
        StringBuilder value = new StringBuilder("[");
        for (int i = 0; i < embedding.size(); i++) {
            if (i > 0) {
                value.append(',');
            }
            value.append(embedding.get(i));
        }
        return value.append(']').toString();
    }

}
