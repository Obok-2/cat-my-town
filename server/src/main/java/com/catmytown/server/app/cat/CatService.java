package com.catmytown.server.app.cat;

import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.CatDetailRes;
import com.catmytown.server.model.CatMarkerListRes;
import com.catmytown.server.model.CatMarkerRes;
import com.catmytown.server.model.CatSightingPageRes;
import com.catmytown.server.model.CatSightingRes;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CatService {

    private static final int SIGHTING_PAGE_SIZE = 10;

    @Autowired
    private CatDao catDao;

    // 고양이 정보(고양이 상세 a7). catId가 이 사용자 소유가 아니면(존재 자체도) 404 —
    // 다른 사용자 고양이인지 여부를 알려주지 않는다.
    public ResponseApi getCatDetail(Long catId, Long userId) {
        CatDetailRes detail = catDao.selectCatBasic(catId, userId);
        if (detail == null) {
            throw new BusinessException(404, "고양이를 찾을 수 없습니다.");
        }
        detail.setSightingCount(catDao.selectSightingCountByCat(catId));
        detail.setTags(catDao.selectCatTagsByCat(catId));
        return ResponseApi.success(detail);
    }

    // 지도 마커. 좌표가 있는 목격만 전부 준다 — 페이지네이션 없음(지도는 전체를 한 번에 그린다)
    public ResponseApi getCatMarkers(Long catId, Long userId) {
        ensureCatOwned(catId, userId);
        List<CatMarkerRes> markers = catDao.selectMarkers(catId);
        return ResponseApi.success(new CatMarkerListRes(markers));
    }

    // 목격 타임라인(무한스크롤). page는 0부터, 한 번에 10건. 11번째를 더 가져와서 있으면 hasMore=true로 트림한다.
    public ResponseApi getCatSightings(Long catId, Long userId, Integer page) {
        ensureCatOwned(catId, userId);
        int safePage = (page == null || page < 0) ? 0 : page;
        int offset = safePage * SIGHTING_PAGE_SIZE;

        List<CatSightingRes> sightings = catDao.selectSightingsPage(catId, offset, SIGHTING_PAGE_SIZE + 1);
        boolean hasMore = sightings.size() > SIGHTING_PAGE_SIZE;
        if (hasMore) {
            sightings.remove(sightings.size() - 1);
        }
        return ResponseApi.success(new CatSightingPageRes(sightings, hasMore));
    }

    private void ensureCatOwned(Long catId, Long userId) {
        if (catDao.selectCatOwnerExists(catId, userId) == 0) {
            throw new BusinessException(404, "고양이를 찾을 수 없습니다.");
        }
    }

}
