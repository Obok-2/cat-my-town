package com.catmytown.server.app.collection;

import com.catmytown.server.common.ApiUrl;
import com.catmytown.server.common.ResponseApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.APP + "/collection")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    @GetMapping("/count")
    public ResponseApi count(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return collectionService.getCatCount(userId);
    }

    @GetMapping("/cats")
    public ResponseApi cats(@RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return collectionService.getCatList(userId);
    }

}
