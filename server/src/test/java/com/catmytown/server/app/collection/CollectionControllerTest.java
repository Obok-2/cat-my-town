package com.catmytown.server.app.collection;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.CollectionCatListRes;
import com.catmytown.server.model.CollectionCatRes;
import com.catmytown.server.model.CollectionCountRes;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CollectionController.class)
class CollectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CollectionService collectionService;

    @Test
    void count_returnsCatCountInResponseApi() throws Exception {
        given(collectionService.getCatCount(1L)).willReturn(ResponseApi.success(new CollectionCountRes(12)));

        mockMvc.perform(get("/app/collection/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("SUCCESS"))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.catCount").value(12));
    }

    @Test
    void count_usesUserIdFromHeader() throws Exception {
        given(collectionService.getCatCount(7L)).willReturn(ResponseApi.success(new CollectionCountRes(3)));

        mockMvc.perform(get("/app/collection/count").header("X-User-Id", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.catCount").value(3));
    }

    @Test
    void cats_returnsCardsWithTags() throws Exception {
        CollectionCatRes cat = new CollectionCatRes();
        cat.setId(12L);
        cat.setName("양말이");
        cat.setPhotoUrl("cats/12/first.jpg");
        cat.setSightingCount(7);
        cat.setTags(List.of("턱시도", "코 옆 흰 점"));
        given(collectionService.getCatList(1L)).willReturn(ResponseApi.success(new CollectionCatListRes(List.of(cat))));

        mockMvc.perform(get("/app/collection/cats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("SUCCESS"))
                .andExpect(jsonPath("$.data.cats[0].id").value(12))
                .andExpect(jsonPath("$.data.cats[0].name").value("양말이"))
                .andExpect(jsonPath("$.data.cats[0].photoUrl").value("cats/12/first.jpg"))
                .andExpect(jsonPath("$.data.cats[0].sightingCount").value(7))
                .andExpect(jsonPath("$.data.cats[0].tags[1]").value("코 옆 흰 점"));
    }

    @Test
    void invalidUserIdHeader_returns400Fail() throws Exception {
        mockMvc.perform(get("/app/collection/count").header("X-User-Id", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.result").value("FAIL"))
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("잘못된 요청입니다."));
    }

    @Test
    void unknownUrl_returns404Fail() throws Exception {
        mockMvc.perform(get("/app/collection/nope"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.result").value("FAIL"))
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void businessException_returnsFailWithItsCode() throws Exception {
        given(collectionService.getCatCount(1L)).willThrow(new BusinessException(404, "사용자를 찾을 수 없어요."));

        mockMvc.perform(get("/app/collection/count"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.result").value("FAIL"))
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("사용자를 찾을 수 없어요."));
    }

    @Test
    void unexpectedException_returns500ErrorWithoutLeakingDetails() throws Exception {
        given(collectionService.getCatCount(1L)).willThrow(new IllegalStateException("secret detail"));

        mockMvc.perform(get("/app/collection/count"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.result").value("ERROR"))
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("서버 오류가 발생했습니다."));
    }

}
