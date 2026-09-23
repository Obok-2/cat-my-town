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

@Service
public class JwtService {

    @Autowired
    private JwtEncoder jwtEncoder;

    @Value("${JWT_EXPIRES_SECONDS:604800}")
    private long expiresIn;

    @Value("${JWT_ISSUER:cat-my-town-server}")
    private String issuer;

    public String createAccessToken(Long userId) {
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .audience(java.util.Collections.singletonList("cat-my-town-app"))
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plusSeconds(expiresIn))
                .id(UUID.randomUUID().toString())
                .claim("role", "USER")
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public long getExpiresIn() {
        return expiresIn;
    }

}
