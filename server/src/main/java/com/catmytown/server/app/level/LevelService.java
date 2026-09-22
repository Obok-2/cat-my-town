package com.catmytown.server.app.level;

import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.LevelCountRes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LevelService {

    @Autowired
    private LevelDao levelDao;

    public ResponseApi getCatCount(Long userId) {
        return ResponseApi.success(new LevelCountRes(levelDao.selectCatCount(userId)));
    }

}
