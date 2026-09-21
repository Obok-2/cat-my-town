package com.catmytown.server.app.level;

import com.catmytown.server.common.ApiUrl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.APP + "/level")
public class LevelController {

    @Autowired
    private LevelService levelService;

}
