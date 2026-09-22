package com.catmytown.server.app.camera;

import com.catmytown.server.common.ApiUrl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.catmytown.server.common.ResponseApi;

@RestController
@RequestMapping(ApiUrl.APP + "/camera")
public class CameraController {

    @Autowired
    private CameraService cameraService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseApi analyze(
            @RequestPart("photo") MultipartFile photo,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return cameraService.analyze(photo, userId);
    }

}
