package com.catmytown.server.security;

import com.catmytown.server.common.BusinessException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

@Component
public class GoogleTokenVerifier {

    private static final String GOOGLE_ISSUER = "https://accounts.google.com";

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    private JwtDecoder googleJwtDecoder;

    @PostConstruct
    public void initialize() {
        if (googleClientId.isBlank()) {
            return;
        }

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withIssuerLocation(GOOGLE_ISSUER).build();
        OAuth2TokenValidator<Jwt> issuerValidator = JwtValidators.createDefaultWithIssuer(GOOGLE_ISSUER);
        OAuth2TokenValidator<Jwt> audienceValidator = new JwtAudienceValidator(googleClientId);
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(issuerValidator, audienceValidator));
        googleJwtDecoder = decoder;
    }

    public Jwt verify(String idToken) {
        if (googleJwtDecoder == null) {
            throw new BusinessException(503, "Google 로그인이 설정되지 않았습니다.");
        }
        try {
            return googleJwtDecoder.decode(idToken);
        } catch (JwtException e) {
            throw new BusinessException(401, "Google 로그인 정보가 올바르지 않습니다.");
        }
    }

}
