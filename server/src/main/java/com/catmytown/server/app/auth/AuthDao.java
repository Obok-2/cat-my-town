package com.catmytown.server.app.auth;

import com.catmytown.server.model.AuthUserVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthDao {

    AuthUserVo upsertGoogleUser(
            @Param("googleUid") String googleUid,
            @Param("displayName") String displayName);

    AuthUserVo selectUser(@Param("userId") Long userId);

}
