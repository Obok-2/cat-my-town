package com.catmytown.server.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserVo {

    private Long id;

    private String email;

    private String passwordHash;

    private String name;

    private String role;

}
