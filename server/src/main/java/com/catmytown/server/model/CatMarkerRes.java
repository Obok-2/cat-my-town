package com.catmytown.server.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 고양이 상세(a7) 미니맵 핀 1개. seq는 이 고양이의 전체 목격 기록 중 몇 번째 만남인지(오래된 순 1부터) —
// 목격 타임라인(CatSightingRes)의 seq와 같은 채번 기준이라 지도·타임라인 번호가 서로 맞는다.
@Getter
@Setter
@NoArgsConstructor
public class CatMarkerRes {

    private Long id;

    private Integer seq;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private OffsetDateTime takenAt;

    private String memo;

    private String photoUrl;

}
