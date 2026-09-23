package com.catmytown.server.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthGoogleReq {

    @NotBlank
    private String idToken;

}
