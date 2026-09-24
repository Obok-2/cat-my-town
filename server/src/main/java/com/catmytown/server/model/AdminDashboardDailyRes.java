package com.catmytown.server.model;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

// 날짜별 목격 기록 수(촬영해서 저장한 수)와 신규 고양이 등록 수
@Getter
@Setter
public class AdminDashboardDailyRes {

    private LocalDate day;

    private Integer sightingCount;

    private Integer newCatCount;

}
