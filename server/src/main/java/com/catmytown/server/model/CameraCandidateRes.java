package com.catmytown.server.model;

import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CameraCandidateRes {

    private Long catId;

    private String name;

    private String photoUrl;

    private Integer sightingCount;

    private double score;

    private List<String> tags;

}
