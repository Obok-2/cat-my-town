package com.catmytown.server.admin.dashboard;

import com.catmytown.server.common.LevelPolicy;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.AdminDashboardActivityRes;
import com.catmytown.server.model.AdminDashboardLevelRes;
import com.catmytown.server.model.AdminDashboardLevelVo;
import com.catmytown.server.model.AdminDashboardRes;
import com.catmytown.server.model.AdminDashboardSummaryRes;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    private static final ZoneId KOREA = ZoneId.of("Asia/Seoul");

    private static final int DAILY_DAYS = 7;

    private static final int ACTIVITY_LIMIT = 10;

    @Autowired
    private AdminDashboardDao adminDashboardDao;

    public ResponseApi getDashboard() {
        AdminDashboardSummaryRes summary = adminDashboardDao.selectSummary();

        AdminDashboardRes response = new AdminDashboardRes();
        response.setAsOf(OffsetDateTime.now(KOREA));
        response.setSummary(summary);
        response.setDaily(adminDashboardDao.selectDaily(DAILY_DAYS));
        response.setLevels(toLevels(adminDashboardDao.selectCatCountDistribution()));
        response.setActivity(maskEmails(adminDashboardDao.selectRecentActivity(ACTIVITY_LIMIT)));
        return ResponseApi.success(response);
    }

    // 관리자 화면에도 이메일 전체는 보여주지 않는다(예: ob36985@gmail.com → ob***@gmail.com)
    private List<AdminDashboardActivityRes> maskEmails(List<AdminDashboardActivityRes> activity) {
        for (AdminDashboardActivityRes item : activity) {
            item.setEmail(maskEmail(item.getEmail()));
        }
        return activity;
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "-";
        }
        int at = email.indexOf('@');
        if (at <= 0) {
            return "***";
        }
        String visible = email.substring(0, Math.min(2, at));
        return visible + "***" + email.substring(at);
    }

    // 고양이 수별 사용자 수를 레벨(0~5)별 사용자 수로 묶는다
    private List<AdminDashboardLevelRes> toLevels(List<AdminDashboardLevelVo> distribution) {
        int[] userCounts = new int[LevelPolicy.MAX_LEVEL + 1];
        for (AdminDashboardLevelVo item : distribution) {
            userCounts[LevelPolicy.calculate(item.getCatCount())] += item.getUserCount();
        }

        List<AdminDashboardLevelRes> levels = new ArrayList<>();
        for (int level = 0; level <= LevelPolicy.MAX_LEVEL; level++) {
            levels.add(new AdminDashboardLevelRes(level, userCounts[level]));
        }
        return levels;
    }

}
