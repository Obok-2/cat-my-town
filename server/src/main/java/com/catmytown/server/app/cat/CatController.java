package com.catmytown.server.app.cat;

import com.catmytown.server.common.ApiUrl;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.model.CatRegisterReq;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

// 고양이 상세 화면(app의 /cat/:id) 전용 API. 도감(collection) 목록·개수와는 다른 도메인이라 패키지를 분리했다.
// catId는 경로변수(@PathVariable) 대신 쿼리 파라미터(@RequestParam)로 받는다.
@RestController
@RequestMapping(ApiUrl.APP + "/cat")
public class CatController {

    @Autowired
    private CatService catService;

    @GetMapping("/detail")
    public ResponseApi detail(
            @RequestParam("catId") Long catId, @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return catService.getCatDetail(catId, userId);
    }

    @GetMapping("/markers")
    public ResponseApi markers(
            @RequestParam("catId") Long catId, @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return catService.getCatMarkers(catId, userId);
    }

    @GetMapping("/sightings")
    public ResponseApi sightings(
            @RequestParam("catId") Long catId,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestParam(value = "page", defaultValue = "0") Integer page) {
        return catService.getCatSightings(catId, userId, page);
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseApi register(
            @RequestPart("file") MultipartFile[] file,
            @RequestPart("contents") CatRegisterReq contents,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return catService.register(file, contents, userId);
    }

}
