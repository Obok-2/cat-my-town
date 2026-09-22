package com.catmytown.server.model;

import java.time.OffsetDateTime;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CatDetailRes {

    private Long id;

    private String name;

    private String photoUrl;

    private List<String> tags;

    private Integer sightingCount;

    private OffsetDateTime firstSeenAt;

}
