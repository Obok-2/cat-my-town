package com.catmytown.server.app.level;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.LevelCountRes;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(LevelController.class)
class LevelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LevelService levelService;

    @Test
    void count_returnsCatCountInResponseApi() throws Exception {
        given(levelService.getCatCount(1L)).willReturn(ResponseApi.success(new LevelCountRes(12)));

        mockMvc.perform(get("/app/level/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("SUCCESS"))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.catCount").value(12));
    }

    @Test
    void count_usesUserIdFromHeader() throws Exception {
        given(levelService.getCatCount(7L)).willReturn(ResponseApi.success(new LevelCountRes(3)));

        mockMvc.perform(get("/app/level/count").header("X-User-Id", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.catCount").value(3));
    }

    @Test
    void count_invalidUserIdHeaderReturns400() throws Exception {
        mockMvc.perform(get("/app/level/count").header("X-User-Id", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.result").value("FAIL"));
    }

}
