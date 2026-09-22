package com.catmytown.server.app.photo;

import com.catmytown.server.common.ApiUrl;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
public class PhotoUrlService {

    public String createCatPhotoUrl(Long catId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(ApiUrl.APP + "/photo")
                .queryParam("catId", catId)
                .build()
                .toUriString();
    }

    public String createSightingPhotoUrl(Long sightingId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(ApiUrl.APP + "/photo")
                .queryParam("sightingId", sightingId)
                .build()
                .toUriString();
    }

}
