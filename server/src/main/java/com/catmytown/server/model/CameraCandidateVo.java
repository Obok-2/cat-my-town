package com.catmytown.server.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CameraCandidateVo {

    private Long catId;

    private String name;

    private String photoUrl;

    private Integer sightingCount;

    private double rawSimilarity;

}
