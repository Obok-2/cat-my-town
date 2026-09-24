package com.catmytown.server.admin.dashboard;

import com.catmytown.server.common.ApiUrl;
import com.catmytown.server.common.ResponseApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiUrl.ADMIN + "/dashboard")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseApi dashboard() {
        return adminDashboardService.getDashboard();
    }

}
