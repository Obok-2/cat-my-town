package com.catmytown.server.model;

import java.math.BigDecimal;
import java.util.List;
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

    private List<String> tags;

    private BigDecimal latitude;

    private BigDecimal longitude;

}
