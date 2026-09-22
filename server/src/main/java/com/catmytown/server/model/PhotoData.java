package com.catmytown.server.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PhotoData {

    private byte[] bytes;

    private String contentType;

}
