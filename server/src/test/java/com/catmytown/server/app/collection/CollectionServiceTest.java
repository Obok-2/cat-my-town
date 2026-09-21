package com.catmytown.server.app.collection;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.CollectionCatListRes;
import com.catmytown.server.model.CollectionCatRes;
import com.catmytown.server.model.CollectionCatTagVo;
import com.catmytown.server.model.CollectionCountRes;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CollectionServiceTest {

    @Mock
    private CollectionDao collectionDao;

    @InjectMocks
    private CollectionService collectionService;

    @Test
    void getCatCount_wrapsDaoCountInSuccessResponse() {
        given(collectionDao.selectCatCount(1L)).willReturn(12);

        ResponseApi res = collectionService.getCatCount(1L);

        assertThat(res.getResult()).isEqualTo(ResponseApi.RESULT.SUCCESS);
        assertThat(res.getCode()).isEqualTo(200);
        CollectionCountRes data = (CollectionCountRes) res.getData();
        assertThat(data.getCatCount()).isEqualTo(12);
    }

    @Test
    void getCatCount_zeroWhenNoCats() {
        given(collectionDao.selectCatCount(1L)).willReturn(0);

        ResponseApi res = collectionService.getCatCount(1L);

        CollectionCountRes data = (CollectionCountRes) res.getData();
        assertThat(data.getCatCount()).isZero();
    }

    @Test
    void getCatList_attachesTagsToEachCatInOrder() {
        given(collectionDao.selectCatCardList(1L)).willReturn(List.of(cat(3L, "구름"), cat(2L, "치즈"), cat(1L, "양말이")));
        given(collectionDao.selectCatTagList(1L)).willReturn(List.of(tag(1L, "턱시도"), tag(1L, "코 옆 흰 점"), tag(2L, "치즈 태비")));

        ResponseApi res = collectionService.getCatList(1L);

        assertThat(res.getResult()).isEqualTo(ResponseApi.RESULT.SUCCESS);
        CollectionCatListRes data = (CollectionCatListRes) res.getData();
        assertThat(data.getCats()).hasSize(3);
        assertThat(data.getCats().get(0).getName()).isEqualTo("구름");
        assertThat(data.getCats().get(1).getName()).isEqualTo("치즈");
        assertThat(data.getCats().get(2).getName()).isEqualTo("양말이");
        assertThat(data.getCats().get(2).getTags()).containsExactly("턱시도", "코 옆 흰 점");
        assertThat(data.getCats().get(1).getTags()).containsExactly("치즈 태비");
    }

    @Test
    void getCatList_catWithoutTagsGetsEmptyList() {
        given(collectionDao.selectCatCardList(1L)).willReturn(List.of(cat(3L, "구름")));
        given(collectionDao.selectCatTagList(1L)).willReturn(List.of());

        ResponseApi res = collectionService.getCatList(1L);

        CollectionCatListRes data = (CollectionCatListRes) res.getData();
        assertThat(data.getCats().get(0).getTags()).isEmpty();
    }

    @Test
    void getCatList_emptyWhenNoCats() {
        given(collectionDao.selectCatCardList(1L)).willReturn(List.of());
        given(collectionDao.selectCatTagList(1L)).willReturn(List.of());

        ResponseApi res = collectionService.getCatList(1L);

        CollectionCatListRes data = (CollectionCatListRes) res.getData();
        assertThat(data.getCats()).isEmpty();
    }

    private CollectionCatRes cat(Long id, String name) {
        CollectionCatRes cat = new CollectionCatRes();
        cat.setId(id);
        cat.setName(name);
        return cat;
    }

    private CollectionCatTagVo tag(Long catId, String tag) {
        CollectionCatTagVo vo = new CollectionCatTagVo();
        vo.setCatId(catId);
        vo.setTag(tag);
        return vo;
    }

}
