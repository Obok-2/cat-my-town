package com.catmytown.server.common;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public final class TagParser {

    private static final int MAX_TAG_COUNT = 5;

    private TagParser() {
    }

    public static List<String> parse(String tagValue) {
        Set<String> uniqueTags = new LinkedHashSet<>();
        if (tagValue == null || tagValue.isBlank()) {
            return new ArrayList<>();
        }

        String[] values = tagValue.split(",");
        for (String value : values) {
            String tag = value.trim();
            if (!tag.isEmpty()) {
                uniqueTags.add(tag);
            }
            if (uniqueTags.size() == MAX_TAG_COUNT) {
                break;
            }
        }
        return new ArrayList<>(uniqueTags);
    }

}
