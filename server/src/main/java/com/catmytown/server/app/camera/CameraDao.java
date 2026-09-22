package com.catmytown.server.app.camera;

import com.catmytown.server.model.CameraCandidateVo;
import com.catmytown.server.model.CameraWeekCountRes;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CameraDao {

    CameraWeekCountRes selectWeekCount(@Param("userId") Long userId);

    int selectCatCount(@Param("userId") Long userId);

    int selectMatchableCatCount(@Param("userId") Long userId);

    List<CameraCandidateVo> selectMatchingCandidates(
            @Param("userId") Long userId,
            @Param("embedding") String embedding,
            @Param("minimumSimilarity") double minimumSimilarity,
            @Param("limit") int limit);

    String selectCatTags(@Param("catId") Long catId);

}
