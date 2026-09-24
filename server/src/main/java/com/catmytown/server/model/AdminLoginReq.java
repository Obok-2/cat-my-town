package com.catmytown.server.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminLoginReq {

    @NotBlank
    private String email;

    @NotBlank
    private String password;

}
