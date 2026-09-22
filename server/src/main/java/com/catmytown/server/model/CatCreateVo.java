package com.catmytown.server.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CatCreateVo {

    private Long id;

    private Long userId;

    private String name;

    private String representativeEmbedding;

    private String photoUrl;

}
