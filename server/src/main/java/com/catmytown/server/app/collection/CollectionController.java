package com.catmytown.server.app.collection;

import com.catmytown.server.common.ApiUrl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.APP + "/collection")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

}
