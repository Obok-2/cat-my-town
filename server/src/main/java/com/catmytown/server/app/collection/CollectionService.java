package com.catmytown.server.app.collection;

import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.common.TagParser;
import com.catmytown.server.model.CollectionCatListRes;
import com.catmytown.server.model.CollectionCatRes;
import com.catmytown.server.model.CollectionCatTagVo;
import com.catmytown.server.model.CollectionCountRes;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CollectionService {

    @Autowired
    private CollectionDao collectionDao;

    public ResponseApi getCatCount(Long userId) {
        return ResponseApi.success(new CollectionCountRes(collectionDao.selectCatCount(userId)));
    }

    public ResponseApi getCatList(Long userId) {
        List<CollectionCatRes> cats = collectionDao.selectCatCardList(userId);
        List<CollectionCatTagVo> tagList = collectionDao.selectCatTagList(userId);

        Map<Long, List<String>> tagsByCatId = new HashMap<>();
        for (CollectionCatTagVo tagVo : tagList) {
            tagsByCatId.put(tagVo.getCatId(), TagParser.parse(tagVo.getTag()));
        }

        for (CollectionCatRes cat : cats) {
            List<String> tags = tagsByCatId.get(cat.getId());
            if (tags == null) {
                tags = new ArrayList<>();
            }
            cat.setTags(tags);
        }
        return ResponseApi.success(new CollectionCatListRes(cats));
    }

}
