package com.catmytown.server.admin.auth;

import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.AdminLoginReq;
import com.catmytown.server.model.AdminLoginRes;
import com.catmytown.server.model.AdminUserRes;
import com.catmytown.server.model.AdminUserVo;
import com.catmytown.server.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    @Autowired
    private AdminAuthDao adminAuthDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // 관리자 계정은 가입 기능 없이 DB(admin_users)에 직접 등록한다. 비밀번호는 BCrypt 해시로 저장한다.
    public ResponseApi login(AdminLoginReq request) {
        AdminUserVo admin = adminAuthDao.selectAdminByEmail(request.getEmail().trim().toLowerCase());
        // 이메일이 없는지 비밀번호가 틀렸는지 구분하지 않고 같은 문구로 응답한다(계정 존재 여부 노출 방지)
        if (admin == null || !passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new BusinessException(401, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        AdminUserRes adminResponse = new AdminUserRes(admin.getId(), admin.getEmail(), admin.getName(), admin.getRole());
        AdminLoginRes response = new AdminLoginRes(
                jwtService.createAdminAccessToken(admin.getId()),
                "Bearer",
                jwtService.getAdminExpiresIn(),
                adminResponse);
        return ResponseApi.success(response);
    }

}
