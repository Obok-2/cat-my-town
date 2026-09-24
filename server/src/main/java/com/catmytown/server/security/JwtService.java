package com.catmytown.server.security;

import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

// 앱 토큰(aud=cat-my-town-app, role=USER)과 관리자 토큰(aud=cat-my-town-admin, role=ADMIN)을 발급한다.
// SecurityConfig가 role로 /app/** 와 /admin/** 접근을 나눈다.
@Service
public class JwtService {

    public static final String APP_AUDIENCE = "cat-my-town-app";

    public static final String ADMIN_AUDIENCE = "cat-my-town-admin";

    @Autowired
    private JwtEncoder jwtEncoder;

    @Value("${JWT_EXPIRES_SECONDS:604800}")
    private long expiresIn;

    @Value("${ADMIN_JWT_EXPIRES_SECONDS:43200}")
    private long adminExpiresIn;

    @Value("${JWT_ISSUER:cat-my-town-server}")
    private String issuer;

    public String createAccessToken(Long userId) {
        return createToken(userId, APP_AUDIENCE, "USER", expiresIn);
    }

    public String createAdminAccessToken(Long adminId) {
        return createToken(adminId, ADMIN_AUDIENCE, "ADMIN", adminExpiresIn);
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public long getAdminExpiresIn() {
        return adminExpiresIn;
    }

    private String createToken(Long subjectId, String audience, String role, long lifetimeSeconds) {
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(String.valueOf(subjectId))
                .audience(java.util.Collections.singletonList(audience))
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plusSeconds(lifetimeSeconds))
                .id(UUID.randomUUID().toString())
                .claim("role", role)
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

}
