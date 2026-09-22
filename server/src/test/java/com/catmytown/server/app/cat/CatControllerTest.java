package com.catmytown.server.app.cat;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.CatDetailRes;
import com.catmytown.server.model.CatMarkerListRes;
import com.catmytown.server.model.CatMarkerRes;
import com.catmytown.server.model.CatSightingPageRes;
import com.catmytown.server.model.CatSightingRes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CatController.class)
class CatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CatService catService;

    @Test
    void detail_returnsDetailInResponseApi() throws Exception {
        CatDetailRes detail = new CatDetailRes();
        detail.setId(12L);
        detail.setName("양말이");
        detail.setPhotoUrl("cats/12/first.jpg");
        detail.setTags(List.of("턱시도", "코 옆 흰 점"));
        detail.setSightingCount(7);
        detail.setFirstSeenAt(OffsetDateTime.parse("2026-04-05T09:00:00+09:00"));
        given(catService.getCatDetail(12L, 1L)).willReturn(ResponseApi.success(detail));

        mockMvc.perform(get("/app/cat/detail").param("catId", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(12))
                .andExpect(jsonPath("$.data.name").value("양말이"))
                .andExpect(jsonPath("$.data.tags[1]").value("코 옆 흰 점"))
                .andExpect(jsonPath("$.data.sightingCount").value(7));
    }

    @Test
    void detail_usesUserIdFromHeader() throws Exception {
        given(catService.getCatDetail(12L, 7L)).willReturn(ResponseApi.success(new CatDetailRes()));

        mockMvc.perform(get("/app/cat/detail").param("catId", "12").header("X-User-Id", "7"))
                .andExpect(status().isOk());
    }

    @Test
    void detail_missingCatIdReturns400() throws Exception {
        mockMvc.perform(get("/app/cat/detail"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.result").value("FAIL"));
    }

    @Test
    void detail_notFoundReturns404Fail() throws Exception {
        given(catService.getCatDetail(99L, 1L)).willThrow(new BusinessException(404, "고양이를 찾을 수 없습니다."));

        mockMvc.perform(get("/app/cat/detail").param("catId", "99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.result").value("FAIL"))
                .andExpect(jsonPath("$.message").value("고양이를 찾을 수 없습니다."));
    }

    @Test
    void markers_returnsMarkersInResponseApi() throws Exception {
        CatMarkerRes marker = new CatMarkerRes();
        marker.setId(301L);
        marker.setSeq(7);
        marker.setLatitude(new BigDecimal("37.56121"));
        marker.setLongitude(new BigDecimal("126.92604"));
        marker.setMemo("놀이터 미끄럼틀 밑");
        given(catService.getCatMarkers(12L, 1L)).willReturn(ResponseApi.success(new CatMarkerListRes(List.of(marker))));

        mockMvc.perform(get("/app/cat/markers").param("catId", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.markers[0].id").value(301))
                .andExpect(jsonPath("$.data.markers[0].seq").value(7))
                .andExpect(jsonPath("$.data.markers[0].latitude").value(37.56121))
                .andExpect(jsonPath("$.data.markers[0].memo").value("놀이터 미끄럼틀 밑"));
    }

    @Test
    void markers_notFoundReturns404Fail() throws Exception {
        given(catService.getCatMarkers(99L, 1L)).willThrow(new BusinessException(404, "고양이를 찾을 수 없습니다."));

        mockMvc.perform(get("/app/cat/markers").param("catId", "99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.result").value("FAIL"));
    }

    @Test
    void sightings_returnsPageWithHasMore() throws Exception {
        CatSightingRes sighting = new CatSightingRes();
        sighting.setId(301L);
        sighting.setSeq(7);
        sighting.setMemo("놀이터 미끄럼틀 밑");
        given(catService.getCatSightings(12L, 1L, 0))
                .willReturn(ResponseApi.success(new CatSightingPageRes(List.of(sighting), true)));

        mockMvc.perform(get("/app/cat/sightings").param("catId", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sightings[0].id").value(301))
                .andExpect(jsonPath("$.data.sightings[0].seq").value(7))
                .andExpect(jsonPath("$.data.hasMore").value(true));
    }

    @Test
    void sightings_usesPageQueryParam() throws Exception {
        given(catService.getCatSightings(12L, 1L, 2))
                .willReturn(ResponseApi.success(new CatSightingPageRes(List.of(), false)));

        mockMvc.perform(get("/app/cat/sightings").param("catId", "12").param("page", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hasMore").value(false));
    }

    @Test
    void sightings_notFoundReturns404Fail() throws Exception {
        given(catService.getCatSightings(99L, 1L, 0)).willThrow(new BusinessException(404, "고양이를 찾을 수 없습니다."));

        mockMvc.perform(get("/app/cat/sightings").param("catId", "99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.result").value("FAIL"));
    }

}
