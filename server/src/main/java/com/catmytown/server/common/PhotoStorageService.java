package com.catmytown.server.common;

import io.minio.MinioClient;
import io.minio.GetObjectArgs;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.ErrorResponseException;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PhotoStorageService {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket}")
    private String bucket;

    public String uploadCatPhoto(byte[] photoBytes, String contentType, Long userId) {
        return upload(photoBytes, contentType, "cats/" + userId + "/");
    }

    public String uploadSightingPhoto(byte[] photoBytes, String contentType, Long userId, Long catId) {
        return upload(photoBytes, contentType, "cats/" + userId + "/" + catId + "/sightings/");
    }

    public byte[] downloadPhoto(String objectName) {
        try (InputStream input = client().getObject(GetObjectArgs.builder()
                .bucket(bucket)
                .object(objectName)
                .build())) {
            return input.readAllBytes();
        } catch (ErrorResponseException e) {
            if ("NoSuchKey".equals(e.errorResponse().code())) {
                throw new BusinessException(404, "사진을 찾을 수 없습니다.");
            }
            log.error("고양이 사진 조회 실패. objectName={}", objectName, e);
            throw new BusinessException(503, "사진 저장소를 사용할 수 없습니다.");
        } catch (Exception e) {
            log.error("고양이 사진 조회 실패. objectName={}", objectName, e);
            throw new BusinessException(503, "사진 저장소를 사용할 수 없습니다.");
        }
    }

    private String upload(byte[] photoBytes, String contentType, String path) {
        String extension = "image/png".equals(contentType) ? ".png" : ".jpg";
        String objectName = path + UUID.randomUUID() + extension;
        try {
            client().putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .contentType(contentType)
                    .stream(new ByteArrayInputStream(photoBytes), (long) photoBytes.length, -1L)
                    .build());
            return objectName;
        } catch (Exception e) {
            log.error("고양이 사진 저장 실패", e);
            throw new BusinessException(503, "사진 저장소를 사용할 수 없습니다.");
        }
    }

    public void deleteQuietly(String objectName) {
        try {
            client().removeObject(RemoveObjectArgs.builder().bucket(bucket).object(objectName).build());
        } catch (Exception e) {
            log.warn("DB 저장 실패 후 사진 정리에 실패했습니다. objectName={}", objectName, e);
        }
    }

    private MinioClient client() {
        return MinioClient.builder().endpoint(endpoint).credentials(accessKey, secretKey).build();
    }

}
