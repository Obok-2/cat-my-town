package com.catmytown.server.admin.auth;

import com.catmytown.server.model.AdminUserVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminAuthDao {

    AdminUserVo selectAdminByEmail(@Param("email") String email);

}
