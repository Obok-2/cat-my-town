package com.catmytown.server.app.camera;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/app/camera")
public class CameraController {

    @Autowired
    private CameraService cameraService;

}
