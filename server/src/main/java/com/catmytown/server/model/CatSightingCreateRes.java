package com.catmytown.server.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CatSightingCreateRes {

    private Long catId;

    private Long sightingId;

    private String name;

    private String photoUrl;

    private int sightingCount;

}
