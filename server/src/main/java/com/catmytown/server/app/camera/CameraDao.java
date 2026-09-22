package com.catmytown.server.app.camera;

import com.catmytown.server.model.CameraCandidateVo;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CameraDao {

    int selectCatCount(@Param("userId") Long userId);

    int selectEmbeddedCatCount(@Param("userId") Long userId);

    List<CameraCandidateVo> selectMatchingCandidates(
            @Param("userId") Long userId,
            @Param("embedding") String embedding,
            @Param("minimumSimilarity") double minimumSimilarity,
            @Param("limit") int limit);

    List<String> selectCatTags(@Param("catId") Long catId);

}
