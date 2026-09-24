package com.catmytown.server.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 레벨별 사용자 수. level 0은 아직 고양이를 등록하지 않은 사용자
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardLevelRes {

    private Integer level;

    private Integer userCount;

}
