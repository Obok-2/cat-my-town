package com.catmytown.server.model;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SightingCreateVo {

    private Long id;

    private Long catId;

    private String photoUrl;

    private String memo;

    private OffsetDateTime takenAt;

}
