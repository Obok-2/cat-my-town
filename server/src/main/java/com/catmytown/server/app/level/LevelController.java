package com.catmytown.server.app.level;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/app/level")
public class LevelController {

    @Autowired
    private LevelService levelService;

}
