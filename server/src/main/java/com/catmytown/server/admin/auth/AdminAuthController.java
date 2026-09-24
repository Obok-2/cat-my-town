package com.catmytown.server.admin.auth;

import com.catmytown.server.common.ApiUrl;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.AdminLoginReq;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.ADMIN + "/auth")
public class AdminAuthController {

    @Autowired
    private AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseApi login(@Valid @RequestBody AdminLoginReq request) {
        return adminAuthService.login(request);
    }

}
