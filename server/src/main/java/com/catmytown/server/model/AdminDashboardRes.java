package com.catmytown.server.model;

import java.time.OffsetDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminDashboardRes {

    private OffsetDateTime asOf;

    private AdminDashboardSummaryRes summary;

    private List<AdminDashboardDailyRes> daily;

    private List<AdminDashboardLevelRes> levels;

    private List<AdminDashboardActivityRes> activity;

}
