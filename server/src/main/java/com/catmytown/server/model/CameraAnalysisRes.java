package com.catmytown.server.model;

import java.util.Collections;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CameraAnalysisRes {

    private CameraAnalysisStatus status;

    private boolean cat;

    private String detectedLabel;

    private double catProbability;

    private List<CameraCandidateRes> candidates = Collections.emptyList();

    public static CameraAnalysisRes notCat(String detectedLabel, double catProbability) {
        return create(CameraAnalysisStatus.NOT_CAT, false, detectedLabel, catProbability);
    }

    public static CameraAnalysisRes newCat(String detectedLabel, double catProbability) {
        return create(CameraAnalysisStatus.NEW_CAT, true, detectedLabel, catProbability);
    }

    private static CameraAnalysisRes create(
            CameraAnalysisStatus status, boolean cat, String detectedLabel, double catProbability) {
        CameraAnalysisRes response = new CameraAnalysisRes();
        response.setStatus(status);
        response.setCat(cat);
        response.setDetectedLabel(detectedLabel);
        response.setCatProbability(catProbability);
        return response;
    }

}
