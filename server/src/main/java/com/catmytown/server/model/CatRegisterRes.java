package com.catmytown.server.model;

import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CatRegisterRes {

    private Long catId;

    private Long sightingId;

    private String name;

    private String photoUrl;

    private List<String> tags;

    private int catCount;

    private int level;

    private boolean leveledUp;

}
