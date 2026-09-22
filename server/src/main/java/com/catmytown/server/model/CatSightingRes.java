package com.catmytown.server.model;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 목격 타임라인(a7) 1건. seq는 CatMarkerRes와 같은 채번 기준(오래된 순 1부터) — "N번째 만남" 표시에 쓴다.
@Getter
@Setter
@NoArgsConstructor
public class CatSightingRes {

    private Long id;

    private Integer seq;

    private String photoUrl;

    private OffsetDateTime takenAt;

    private String memo;

}
