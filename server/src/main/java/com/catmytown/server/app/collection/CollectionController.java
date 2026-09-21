package com.catmytown.server.app.collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/app/collection")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

}
