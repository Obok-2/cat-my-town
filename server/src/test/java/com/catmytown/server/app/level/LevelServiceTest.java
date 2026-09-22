package com.catmytown.server.app.level;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.LevelCountRes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LevelServiceTest {

    @Mock
    private LevelDao levelDao;

    @InjectMocks
    private LevelService levelService;

    @Test
    void getCatCount_wrapsDaoCountInSuccessResponse() {
        given(levelDao.selectCatCount(1L)).willReturn(12);

        ResponseApi res = levelService.getCatCount(1L);

        assertThat(res.getResult()).isEqualTo(ResponseApi.RESULT.SUCCESS);
        assertThat(res.getCode()).isEqualTo(200);
        LevelCountRes data = (LevelCountRes) res.getData();
        assertThat(data.getCatCount()).isEqualTo(12);
    }

    @Test
    void getCatCount_zeroWhenNoCats() {
        given(levelDao.selectCatCount(1L)).willReturn(0);

        ResponseApi res = levelService.getCatCount(1L);

        LevelCountRes data = (LevelCountRes) res.getData();
        assertThat(data.getCatCount()).isZero();
    }

}
