package com.catmytown.server.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SightingCreateVo {

    private Long id;

    private Long catId;

    private String photoUrl;

    private String embedding;

    private String memo;

    private String tags;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private OffsetDateTime takenAt;

}
