package com.catmytown.server.app.photo;

import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.PhotoStorageService;
import com.catmytown.server.model.PhotoData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PhotoService {

    @Autowired
    private PhotoDao photoDao;

    @Autowired
    private PhotoStorageService photoStorageService;

    public PhotoData getPhoto(Long catId, Long sightingId, Long userId) {
        if ((catId == null && sightingId == null) || (catId != null && sightingId != null)) {
            throw new BusinessException(400, "catId 또는 sightingId 중 하나만 보내주세요.");
        }
        String objectName;
        if (catId != null) {
            objectName = photoDao.selectCatPhotoObjectName(catId, userId);
        } else {
            objectName = photoDao.selectSightingPhotoObjectName(sightingId, userId);
        }
        return readPhoto(objectName);
    }

    private PhotoData readPhoto(String objectName) {
        if (objectName == null || objectName.isBlank()) {
            throw new BusinessException(404, "사진을 찾을 수 없습니다.");
        }

        byte[] bytes = photoStorageService.downloadPhoto(objectName);
        return new PhotoData(bytes, contentTypeOf(objectName));
    }

    private String contentTypeOf(String objectName) {
        return objectName.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    }

}
