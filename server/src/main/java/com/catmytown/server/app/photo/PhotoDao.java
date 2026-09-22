package com.catmytown.server.app.photo;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PhotoDao {

    String selectCatPhotoObjectName(@Param("catId") Long catId, @Param("userId") Long userId);

    String selectSightingPhotoObjectName(@Param("sightingId") Long sightingId, @Param("userId") Long userId);

}
