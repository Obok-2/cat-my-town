package com.catmytown.server.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthLoginRes {

    private String accessToken;

    private String tokenType;

    private long expiresIn;

    private AuthUserRes user;

}
