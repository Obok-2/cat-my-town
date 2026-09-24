package com.catmytown.server.model;

import lombok.Getter;
import lombok.Setter;

// 대시보드 KPI 숫자. "오늘"·"어제"는 한국 시간(Asia/Seoul) 기준이다.
@Getter
@Setter
public class AdminDashboardSummaryRes {

    private Integer totalUsers;

    private Integer newUsers30d;

    private Integer activeUsers7d;

    private Integer totalCats;

    private Integer newCats30d;

    private Integer totalSightings;

    private Integer todaySightings;

    private Integer yesterdaySightings;

}
