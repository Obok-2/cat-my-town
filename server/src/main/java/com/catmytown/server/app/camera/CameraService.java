package com.catmytown.server.app.camera;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CameraService {

    @Autowired
    private CameraDao cameraDao;

}
