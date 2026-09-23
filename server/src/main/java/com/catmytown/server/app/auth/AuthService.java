package com.catmytown.server.app.auth;

import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.AuthGoogleReq;
import com.catmytown.server.model.AuthLoginRes;
import com.catmytown.server.model.AuthUserRes;
import com.catmytown.server.model.AuthUserVo;
import com.catmytown.server.security.GoogleTokenVerifier;
import com.catmytown.server.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthDao authDao;

    @Autowired
    private GoogleTokenVerifier googleTokenVerifier;

    @Autowired
    private JwtService jwtService;

    @Transactional
    public ResponseApi loginWithGoogle(AuthGoogleReq request) {
        Jwt googleToken = googleTokenVerifier.verify(request.getIdToken());
        String displayName = googleToken.getClaimAsString("name");
        if (displayName == null || displayName.isBlank()) {
            displayName = "산책자";
        }

        AuthUserVo user = authDao.upsertGoogleUser(googleToken.getSubject(), displayName);
        AuthUserRes userResponse = new AuthUserRes(user.getId(), user.getDisplayName());
        AuthLoginRes response = new AuthLoginRes(
                jwtService.createAccessToken(user.getId()),
                "Bearer",
                jwtService.getExpiresIn(),
                userResponse);
        return ResponseApi.success(response);
    }

    public ResponseApi getMe(Long userId) {
        AuthUserVo user = authDao.selectUser(userId);
        if (user == null) {
            throw new BusinessException(404, "사용자를 찾을 수 없습니다.");
        }
        return ResponseApi.success(new AuthUserRes(user.getId(), user.getDisplayName()));
    }

}
