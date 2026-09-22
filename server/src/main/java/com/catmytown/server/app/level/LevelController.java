package com.catmytown.server.app.level;

import com.catmytown.server.common.ApiUrl;
import com.catmytown.server.common.ResponseApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.APP + "/level")
public class LevelController {

    @Autowired
    private LevelService levelService;

    @GetMapping("/count")
    public ResponseApi count(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return levelService.getCatCount(userId);
    }

}
