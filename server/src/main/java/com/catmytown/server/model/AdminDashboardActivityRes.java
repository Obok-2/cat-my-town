package com.catmytown.server.model;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

// 최근 활동: 최근에 Google 로그인한 사용자
@Getter
@Setter
public class AdminDashboardActivityRes {

    private Long userId;

    // users.display_name(Google 이메일)을 가린 값. 예: ob***@gmail.com
    private String email;

    private OffsetDateTime lastLoginAt;

}
