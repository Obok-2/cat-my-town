package com.catmytown.server.admin.dashboard;

import com.catmytown.server.model.AdminDashboardActivityRes;
import com.catmytown.server.model.AdminDashboardDailyRes;
import com.catmytown.server.model.AdminDashboardLevelVo;
import com.catmytown.server.model.AdminDashboardSummaryRes;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AdminDashboardDao {

    AdminDashboardSummaryRes selectSummary();

    List<AdminDashboardDailyRes> selectDaily(@Param("days") int days);

    List<AdminDashboardLevelVo> selectCatCountDistribution();

    List<AdminDashboardActivityRes> selectRecentActivity(@Param("limit") int limit);

}
