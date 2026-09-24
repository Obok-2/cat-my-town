package com.catmytown.server.model;

import lombok.Getter;
import lombok.Setter;

// 등록 고양이 수별 사용자 수 (레벨 분포 계산용)
@Getter
@Setter
public class AdminDashboardLevelVo {

    private Integer catCount;

    private Integer userCount;

}
