package com.catmytown.server.model;

import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CollectionCatRes {

    private Long id;

    private String name;

    private String photoUrl;

    private Integer sightingCount;

    private List<String> tags;

}
