package com.catmytown.server.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CatSightingCreateReq {

    private String analysisId;

    private Long catId;

    private String memo;

}
