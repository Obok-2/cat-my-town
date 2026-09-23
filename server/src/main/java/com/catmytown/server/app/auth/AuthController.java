package com.catmytown.server.app.auth;

import com.catmytown.server.common.ApiUrl;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.AuthGoogleReq;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.APP + "/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/google")
    public ResponseApi google(@Valid @RequestBody AuthGoogleReq request) {
        return authService.loginWithGoogle(request);
    }

    @GetMapping("/me")
    public ResponseApi me(Authentication authentication) {
        return authService.getMe(Long.valueOf(authentication.getName()));
    }

}
