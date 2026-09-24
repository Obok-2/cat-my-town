package com.catmytown.server.security;

import java.util.List;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

// 토큰의 aud에 허용된 대상 중 하나라도 들어 있으면 통과한다(앱 토큰·관리자 토큰을 같은 디코더로 검증).
public class JwtAudienceValidator implements OAuth2TokenValidator<Jwt> {

    private final String[] expectedAudiences;

    public JwtAudienceValidator(String... expectedAudiences) {
        this.expectedAudiences = expectedAudiences;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        List<String> audience = token.getAudience();
        if (audience != null) {
            for (String expected : expectedAudiences) {
                if (audience.contains(expected)) {
                    return OAuth2TokenValidatorResult.success();
                }
            }
        }
        OAuth2Error error = new OAuth2Error("invalid_token", "토큰 대상이 올바르지 않습니다.", null);
        return OAuth2TokenValidatorResult.failure(error);
    }

}
