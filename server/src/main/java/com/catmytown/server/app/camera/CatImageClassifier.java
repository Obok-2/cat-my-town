package com.catmytown.server.app.camera;

import ai.djl.Application;
import ai.djl.ModelException;
import ai.djl.inference.Predictor;
import ai.djl.modality.Classifications;
import ai.djl.modality.cv.Image;
import ai.djl.modality.cv.ImageFactory;
import ai.djl.repository.zoo.Criteria;
import ai.djl.repository.zoo.ModelZoo;
import ai.djl.repository.zoo.ZooModel;
import ai.djl.translate.TranslateException;
import jakarta.annotation.PreDestroy;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.catmytown.server.common.BusinessException;

@Slf4j
@Service
public class CatImageClassifier {

    private static final Set<String> CAT_SYNSETS = Set.of(
            "n02123045", // tabby
            "n02123159", // tiger cat
            "n02123394", // Persian cat
            "n02123597", // Siamese cat
            "n02124075", // Egyptian cat
            "n02127052"  // lynx, catamount
    );

    private final Object modelLock = new Object();

    private volatile ZooModel<Image, Classifications> model;

    @Value("${camera.cat-detection.min-confidence}")
    private double minimumConfidence;

    public CatDetectionResult classify(byte[] photoBytes) {
        Image image;
        try {
            image = ImageFactory.getInstance().fromInputStream(new ByteArrayInputStream(photoBytes));
        } catch (IOException e) {
            throw new BusinessException(400, "올바른 이미지 파일이 아닙니다.");
        }

        try {
            try (Predictor<Image, Classifications> predictor = getModel().newPredictor()) {
                Classifications classifications = predictor.predict(image);
                Classifications.Classification best = classifications.best();
                Classifications.Classification bestCat = findBestCat(classifications);
                double catProbability = catProbability(classifications);
                boolean isCat = bestCat != null && catProbability >= minimumConfidence;
                return new CatDetectionResult(isCat, best.getClassName(), catProbability);
            }
        } catch (IOException | ModelException | TranslateException e) {
            log.warn("DJL 고양이 이미지 판별 실패", e);
            throw new BusinessException(503, "이미지 판별 서비스를 사용할 수 없습니다.");
        } catch (RuntimeException e) {
            log.warn("DJL 고양이 이미지 판별 런타임 오류", e);
            throw new BusinessException(503, "이미지 판별 서비스를 사용할 수 없습니다.");
        }
    }

    private Classifications.Classification findBestCat(Classifications classifications) {
        Classifications.Classification bestCat = null;
        for (Classifications.Classification item : classifications.items()) {
            if (!isCatClass(item.getClassName())) {
                continue;
            }
            if (bestCat == null || item.getProbability() > bestCat.getProbability()) {
                bestCat = item;
            }
        }
        return bestCat;
    }

    private double catProbability(Classifications classifications) {
        double probability = 0;
        for (Classifications.Classification item : classifications.items()) {
            if (isCatClass(item.getClassName())) {
                probability += item.getProbability();
            }
        }
        return Math.min(1, probability);
    }

    private boolean isCatClass(String className) {
        for (String synset : CAT_SYNSETS) {
            if (className.startsWith(synset)) {
                return true;
            }
        }
        return false;
    }

    private ZooModel<Image, Classifications> getModel() throws ModelException, IOException {
        ZooModel<Image, Classifications> loaded = model;
        if (loaded != null) {
            return loaded;
        }
        synchronized (modelLock) {
            if (model == null) {
                Criteria<Image, Classifications> criteria = Criteria.builder()
                        .optApplication(Application.CV.IMAGE_CLASSIFICATION)
                        .setTypes(Image.class, Classifications.class)
                        .optArtifactId("resnet")
                        .optFilter("layers", "18")
                        .optFilter("dataset", "imagenet")
                        .optEngine("PyTorch")
                        .build();
                model = ModelZoo.loadModel(criteria);
            }
            return model;
        }
    }

    @PreDestroy
    public void closeModel() {
        ZooModel<Image, Classifications> loaded = model;
        if (loaded != null) {
            loaded.close();
        }
    }

}
