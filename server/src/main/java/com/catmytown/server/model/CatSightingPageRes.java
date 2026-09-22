package com.catmytown.server.model;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CatSightingPageRes {

    private List<CatSightingRes> sightings;

    // true면 더 불러올 목격 기록이 남아있다는 뜻 — 앱은 이 값을 보고 무한스크롤 다음 페이지를 요청한다.
    private Boolean hasMore;

}
