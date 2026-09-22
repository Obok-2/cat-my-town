package com.catmytown.server.app.level;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LevelDao {

    int selectCatCount(@Param("userId") Long userId);

}
