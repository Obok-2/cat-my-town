package com.catmytown.server.app.cat;

import com.catmytown.server.model.CatDetailRes;
import com.catmytown.server.model.CatMarkerRes;
import com.catmytown.server.model.CatSightingRes;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CatDao {

    CatDetailRes selectCatBasic(@Param("catId") Long catId, @Param("userId") Long userId);

    int selectCatOwnerExists(@Param("catId") Long catId, @Param("userId") Long userId);

    int selectSightingCountByCat(@Param("catId") Long catId);

    List<String> selectCatTagsByCat(@Param("catId") Long catId);

    List<CatMarkerRes> selectMarkers(@Param("catId") Long catId);

    List<CatSightingRes> selectSightingsPage(
            @Param("catId") Long catId, @Param("offset") int offset, @Param("limit") int limit);

}
