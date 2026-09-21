package com.catmytown.server.app.collection;

import com.catmytown.server.model.CollectionCatRes;
import com.catmytown.server.model.CollectionCatTagVo;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CollectionDao {

    int selectCatCount(@Param("userId") Long userId);

    List<CollectionCatRes> selectCatCardList(@Param("userId") Long userId);

    List<CollectionCatTagVo> selectCatTagList(@Param("userId") Long userId);

}
