package com.catmytown.server.app.camera;

public class CatDetectionResult {

    private final boolean cat;

    private final String label;

    private final double catProbability;

    public CatDetectionResult(boolean cat, String label, double catProbability) {
        this.cat = cat;
        this.label = label;
        this.catProbability = catProbability;
    }

    public boolean isCat() {
        return cat;
    }

    public String getLabel() {
        return label;
    }

    public double getCatProbability() {
        return catProbability;
    }

}
