package com.catmytown.server.app.collection;

import com.catmytown.server.common.ApiUrl;
import com.catmytown.server.common.ResponseApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.APP + "/collection")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    @GetMapping("/count")
    public ResponseApi count(Authentication authentication) {
        return collectionService.getCatCount(Long.valueOf(authentication.getName()));
    }

    @GetMapping("/cats")
    public ResponseApi cats(Authentication authentication) {
        return collectionService.getCatList(Long.valueOf(authentication.getName()));
    }

}
