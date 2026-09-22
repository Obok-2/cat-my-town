package com.catmytown.server.app.cat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.CatDetailRes;
import com.catmytown.server.model.CatMarkerListRes;
import com.catmytown.server.model.CatMarkerRes;
import com.catmytown.server.model.CatSightingPageRes;
import com.catmytown.server.model.CatSightingRes;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CatServiceTest {

    @Mock
    private CatDao catDao;

    @InjectMocks
    private CatService catService;

    @Test
    void getCatDetail_attachesCountAndTagsToBasicInfo() {
        CatDetailRes basic = new CatDetailRes();
        basic.setId(12L);
        basic.setName("양말이");
        given(catDao.selectCatBasic(12L, 1L)).willReturn(basic);
        given(catDao.selectSightingCountByCat(12L)).willReturn(7);
        given(catDao.selectCatTagsByCat(12L)).willReturn(List.of("턱시도", "코 옆 흰 점"));

        ResponseApi res = catService.getCatDetail(12L, 1L);

        CatDetailRes data = (CatDetailRes) res.getData();
        assertThat(data.getName()).isEqualTo("양말이");
        assertThat(data.getSightingCount()).isEqualTo(7);
        assertThat(data.getTags()).containsExactly("턱시도", "코 옆 흰 점");
    }

    @Test
    void getCatDetail_throwsBusinessExceptionWhenNotOwned() {
        given(catDao.selectCatBasic(99L, 1L)).willReturn(null);

        assertThatThrownBy(() -> catService.getCatDetail(99L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("고양이를 찾을 수 없습니다.");
    }

    @Test
    void getCatMarkers_returnsMarkersFromDao() {
        given(catDao.selectCatOwnerExists(12L, 1L)).willReturn(1);
        CatMarkerRes marker = new CatMarkerRes();
        marker.setId(301L);
        marker.setSeq(7);
        given(catDao.selectMarkers(12L)).willReturn(List.of(marker));

        ResponseApi res = catService.getCatMarkers(12L, 1L);

        CatMarkerListRes data = (CatMarkerListRes) res.getData();
        assertThat(data.getMarkers()).hasSize(1);
        assertThat(data.getMarkers().get(0).getSeq()).isEqualTo(7);
    }

    @Test
    void getCatMarkers_throwsBusinessExceptionWhenNotOwned() {
        given(catDao.selectCatOwnerExists(99L, 1L)).willReturn(0);

        assertThatThrownBy(() -> catService.getCatMarkers(99L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("고양이를 찾을 수 없습니다.");
    }

    @Test
    void getCatSightings_trimsExtraItemAndSetsHasMoreTrue() {
        given(catDao.selectCatOwnerExists(12L, 1L)).willReturn(1);
        List<CatSightingRes> elevenItems = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            elevenItems.add(sighting((long) (11 - i)));
        }
        given(catDao.selectSightingsPage(12L, 0, 11)).willReturn(elevenItems);

        ResponseApi res = catService.getCatSightings(12L, 1L, 0);

        CatSightingPageRes data = (CatSightingPageRes) res.getData();
        assertThat(data.getSightings()).hasSize(10);
        assertThat(data.getHasMore()).isTrue();
    }

    @Test
    void getCatSightings_hasMoreFalseWhenFewerThanPageSizePlusOne() {
        given(catDao.selectCatOwnerExists(12L, 1L)).willReturn(1);
        given(catDao.selectSightingsPage(12L, 0, 11)).willReturn(List.of(sighting(1L)));

        ResponseApi res = catService.getCatSightings(12L, 1L, 0);

        CatSightingPageRes data = (CatSightingPageRes) res.getData();
        assertThat(data.getSightings()).hasSize(1);
        assertThat(data.getHasMore()).isFalse();
    }

    @Test
    void getCatSightings_secondPageUsesOffsetTen() {
        given(catDao.selectCatOwnerExists(12L, 1L)).willReturn(1);
        given(catDao.selectSightingsPage(12L, 10, 11)).willReturn(List.of(sighting(1L)));

        catService.getCatSightings(12L, 1L, 1);

        Mockito.verify(catDao).selectSightingsPage(12L, 10, 11);
    }

    @Test
    void getCatSightings_negativePageClampedToZero() {
        given(catDao.selectCatOwnerExists(12L, 1L)).willReturn(1);
        given(catDao.selectSightingsPage(12L, 0, 11)).willReturn(List.of());

        catService.getCatSightings(12L, 1L, -3);

        Mockito.verify(catDao).selectSightingsPage(12L, 0, 11);
    }

    @Test
    void getCatSightings_throwsBusinessExceptionWhenNotOwned() {
        given(catDao.selectCatOwnerExists(99L, 1L)).willReturn(0);

        assertThatThrownBy(() -> catService.getCatSightings(99L, 1L, 0))
                .isInstanceOf(BusinessException.class)
                .hasMessage("고양이를 찾을 수 없습니다.");
    }

    private CatSightingRes sighting(Long id) {
        CatSightingRes s = new CatSightingRes();
        s.setId(id);
        return s;
    }

}
