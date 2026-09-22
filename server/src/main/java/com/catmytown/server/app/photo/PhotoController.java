package com.catmytown.server.app.photo;

import com.catmytown.server.common.ApiUrl;
import com.catmytown.server.model.PhotoData;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.APP + "/photo")
public class PhotoController {

    @Autowired
    private PhotoService photoService;

    @GetMapping
    public ResponseEntity<byte[]> photo(
            @RequestParam("catId") Long catId,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        PhotoData photo = photoService.getCatPhoto(catId, userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.getContentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePrivate())
                .body(photo.getBytes());
    }

}
