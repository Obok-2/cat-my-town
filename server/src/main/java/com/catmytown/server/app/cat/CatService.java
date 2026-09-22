package com.catmytown.server.app.cat;

import com.catmytown.server.app.camera.VoyageImageEmbeddingClient;
import com.catmytown.server.app.camera.AnalysisEmbeddingStore;
import com.catmytown.server.app.photo.PhotoUrlService;
import com.catmytown.server.common.BusinessException;
import com.catmytown.server.common.PhotoStorageService;
import com.catmytown.server.common.ResponseApi;
import com.catmytown.server.common.TagParser;
import com.catmytown.server.model.CatCreateVo;
import com.catmytown.server.model.CatDetailRes;
import com.catmytown.server.model.CatMarkerListRes;
import com.catmytown.server.model.CatMarkerRes;
import com.catmytown.server.model.CatRegisterRes;
import com.catmytown.server.model.CatRegisterReq;
import com.catmytown.server.model.CatSightingPageRes;
import com.catmytown.server.model.CatSightingCreateReq;
import com.catmytown.server.model.CatSightingCreateRes;
import com.catmytown.server.model.CatSightingRes;
import com.catmytown.server.model.SightingCreateVo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CatService {

    private static final int SIGHTING_PAGE_SIZE = 10;

    @Autowired
    private CatDao catDao;

    @Autowired
    private VoyageImageEmbeddingClient voyageImageEmbeddingClient;

    @Autowired
    private AnalysisEmbeddingStore analysisEmbeddingStore;

    @Autowired
    private PhotoStorageService photoStorageService;

    @Autowired
    private PhotoUrlService photoUrlService;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public ResponseApi register(MultipartFile[] file, String contentsJson, Long userId) {
        if (file == null || file.length != 1) {
            throw new BusinessException(400, "사진 파일을 1장만 보내주세요.");
        }

        MultipartFile photo = file[0];
        CatRegisterReq contents = readContents(contentsJson);
        validatePhoto(photo);
        String normalizedName = normalizeRequired(contents.getName(), 12, "고양이 이름은 1~12자로 입력해주세요.");
        String normalizedMemo = normalizeOptional(
                contents.getMemo(), 200, "첫 만남 메모는 200자 이하로 입력해주세요.");
        List<String> normalizedTags = normalizeTags(contents.getTags());
        BigDecimal[] coordinates = normalizeCoordinates(contents.getLatitude(), contents.getLongitude());
        if ((contents.getAnalysisId() == null || contents.getAnalysisId().isBlank())
                && catDao.selectCatCountByUser(userId) > 0) {
            throw new BusinessException(400, "사진 분석 결과가 필요합니다. 다시 촬영해주세요.");
        }

        byte[] photoBytes = readPhoto(photo);
        List<Double> embedding = resolveEmbedding(
                contents.getAnalysisId(), userId, photoBytes, photo.getContentType());
        String objectName = photoStorageService.uploadCatPhoto(photoBytes, photo.getContentType(), userId);

        try {
            CatCreateVo cat = new CatCreateVo();
            cat.setUserId(userId);
            cat.setName(normalizedName);
            catDao.insertCat(cat);

            SightingCreateVo sighting = new SightingCreateVo();
            sighting.setCatId(cat.getId());
            sighting.setPhotoUrl(objectName);
            sighting.setEmbedding(toVectorLiteral(embedding));
            sighting.setMemo(normalizedMemo);
            sighting.setTags(toTagValue(normalizedTags));
            sighting.setLatitude(coordinates[0]);
            sighting.setLongitude(coordinates[1]);
            sighting.setTakenAt(OffsetDateTime.now());
            catDao.insertSighting(sighting);

            int catCount = catDao.selectCatCountByUser(userId);
            int level = calculateLevel(catCount);
            int previousLevel = calculateLevel(catCount - 1);
            // users.level 캐시는 당분간 갱신하지 않고 고양이 수를 기준으로 레벨을 계산한다.
            // catDao.updateUserLevel(userId, level);

            CatRegisterRes response = new CatRegisterRes();
            response.setCatId(cat.getId());
            response.setSightingId(sighting.getId());
            response.setName(normalizedName);
            response.setPhotoUrl(photoUrlService.createCatPhotoUrl(cat.getId()));
            response.setTags(normalizedTags);
            response.setCatCount(catCount);
            response.setLevel(level);
            response.setLeveledUp(level > previousLevel);
            analysisEmbeddingStore.remove(contents.getAnalysisId(), userId);
            return ResponseApi.success(response);
        } catch (RuntimeException e) {
            photoStorageService.deleteQuietly(objectName);
            throw e;
        }
    }

    @Transactional
    public ResponseApi addSighting(MultipartFile[] file, String contentsJson, Long userId) {
        if (file == null || file.length != 1) {
            throw new BusinessException(400, "사진 파일을 1장만 보내주세요.");
        }

        MultipartFile photo = file[0];
        CatSightingCreateReq contents = readSightingContents(contentsJson);
        validatePhoto(photo);
        if (contents.getCatId() == null) {
            throw new BusinessException(400, "고양이 ID가 필요합니다.");
        }
        if (contents.getAnalysisId() == null || contents.getAnalysisId().isBlank()) {
            throw new BusinessException(400, "사진 분석 결과가 필요합니다. 다시 촬영해주세요.");
        }

        CatDetailRes cat = catDao.selectCatBasic(contents.getCatId(), userId);
        if (cat == null) {
            throw new BusinessException(404, "고양이를 찾을 수 없습니다.");
        }
        String normalizedMemo = normalizeOptional(
                contents.getMemo(), 200, "목격 메모는 200자 이하로 입력해주세요.");
        List<String> normalizedTags = normalizeTags(contents.getTags());
        BigDecimal[] coordinates = normalizeCoordinates(contents.getLatitude(), contents.getLongitude());

        byte[] photoBytes = readPhoto(photo);
        List<Double> embedding = resolveEmbedding(
                contents.getAnalysisId(), userId, photoBytes, photo.getContentType());
        String objectName = photoStorageService.uploadSightingPhoto(
                photoBytes, photo.getContentType(), userId, contents.getCatId());

        try {
            SightingCreateVo sighting = new SightingCreateVo();
            sighting.setCatId(contents.getCatId());
            sighting.setPhotoUrl(objectName);
            sighting.setEmbedding(toVectorLiteral(embedding));
            sighting.setMemo(normalizedMemo);
            sighting.setTags(toTagValue(normalizedTags));
            sighting.setLatitude(coordinates[0]);
            sighting.setLongitude(coordinates[1]);
            sighting.setTakenAt(OffsetDateTime.now());
            catDao.insertSighting(sighting);

            CatSightingCreateRes response = new CatSightingCreateRes();
            response.setCatId(contents.getCatId());
            response.setSightingId(sighting.getId());
            response.setName(cat.getName());
            response.setPhotoUrl(photoUrlService.createSightingPhotoUrl(sighting.getId()));
            response.setSightingCount(catDao.selectSightingCountByCat(contents.getCatId()));
            analysisEmbeddingStore.remove(contents.getAnalysisId(), userId);
            return ResponseApi.success(response);
        } catch (RuntimeException e) {
            photoStorageService.deleteQuietly(objectName);
            throw e;
        }
    }

    // 고양이 정보(고양이 상세 a7). catId가 이 사용자 소유가 아니면(존재 자체도) 404 —
    // 다른 사용자 고양이인지 여부를 알려주지 않는다.
    public ResponseApi getCatDetail(Long catId, Long userId) {
        CatDetailRes detail = catDao.selectCatBasic(catId, userId);
        if (detail == null) {
            throw new BusinessException(404, "고양이를 찾을 수 없습니다.");
        }
        detail.setSightingCount(catDao.selectSightingCountByCat(catId));
        detail.setTags(TagParser.parse(catDao.selectCatTagsByCat(catId)));
        detail.setPhotoUrl(photoUrlService.createCatPhotoUrl(catId));
        return ResponseApi.success(detail);
    }

    // 지도 마커. 좌표가 있는 목격만 전부 준다 — 페이지네이션 없음(지도는 전체를 한 번에 그린다)
    public ResponseApi getCatMarkers(Long catId, Long userId) {
        ensureCatOwned(catId, userId);
        List<CatMarkerRes> markers = catDao.selectMarkers(catId);
        for (CatMarkerRes marker : markers) {
            marker.setPhotoUrl(photoUrlService.createSightingPhotoUrl(marker.getId()));
        }
        return ResponseApi.success(new CatMarkerListRes(markers));
    }

    // 목격 타임라인(무한스크롤). page는 0부터, 한 번에 10건. 11번째를 더 가져와서 있으면 hasMore=true로 트림한다.
    public ResponseApi getCatSightings(Long catId, Long userId, Integer page) {
        ensureCatOwned(catId, userId);
        int safePage = (page == null || page < 0) ? 0 : page;
        int offset = safePage * SIGHTING_PAGE_SIZE;

        List<CatSightingRes> sightings = catDao.selectSightingsPage(catId, offset, SIGHTING_PAGE_SIZE + 1);
        for (CatSightingRes sighting : sightings) {
            sighting.setTags(TagParser.parse(sighting.getTagValue()));
            sighting.setPhotoUrl(photoUrlService.createSightingPhotoUrl(sighting.getId()));
        }
        boolean hasMore = sightings.size() > SIGHTING_PAGE_SIZE;
        if (hasMore) {
            sightings.remove(sightings.size() - 1);
        }
        return ResponseApi.success(new CatSightingPageRes(sightings, hasMore));
    }

    private void ensureCatOwned(Long catId, Long userId) {
        if (catDao.selectCatOwnerExists(catId, userId) == 0) {
            throw new BusinessException(404, "고양이를 찾을 수 없습니다.");
        }
    }

    private void validatePhoto(MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            throw new BusinessException(400, "사진 파일이 필요합니다.");
        }
        String contentType = photo.getContentType();
        if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
            throw new BusinessException(400, "JPEG 또는 PNG 사진만 사용할 수 있습니다.");
        }
    }

    private byte[] readPhoto(MultipartFile photo) {
        try {
            return photo.getBytes();
        } catch (IOException e) {
            throw new BusinessException(400, "사진을 읽을 수 없습니다.");
        }
    }

    private CatRegisterReq readContents(String contentsJson) {
        if (contentsJson == null || contentsJson.isBlank()) {
            throw new BusinessException(400, "등록 내용이 필요합니다.");
        }
        try {
            return objectMapper.readValue(contentsJson, CatRegisterReq.class);
        } catch (JsonProcessingException e) {
            throw new BusinessException(400, "등록 내용 형식이 올바르지 않습니다.");
        }
    }

    private CatSightingCreateReq readSightingContents(String contentsJson) {
        if (contentsJson == null || contentsJson.isBlank()) {
            throw new BusinessException(400, "목격 내용이 필요합니다.");
        }
        try {
            return objectMapper.readValue(contentsJson, CatSightingCreateReq.class);
        } catch (JsonProcessingException e) {
            throw new BusinessException(400, "목격 내용 형식이 올바르지 않습니다.");
        }
    }

    private List<Double> resolveEmbedding(
            String analysisId, Long userId, byte[] photoBytes, String contentType) {
        if (analysisId != null && !analysisId.isBlank()) {
            return analysisEmbeddingStore.get(analysisId, userId);
        }
        return voyageImageEmbeddingClient.createImageEmbedding(photoBytes, contentType);
    }

    private String normalizeRequired(String value, int maxLength, String message) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isEmpty() || normalized.length() > maxLength) {
            throw new BusinessException(400, message);
        }
        return normalized;
    }

    private String normalizeOptional(String value, int maxLength, String message) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new BusinessException(400, message);
        }
        return normalized;
    }

    private List<String> normalizeTags(List<String> tags) {
        Set<String> uniqueTags = new LinkedHashSet<>();
        if (tags == null) {
            return new ArrayList<>();
        }
        for (String tag : tags) {
            String normalized = normalizeRequired(tag, 30, "특징 태그는 각각 1~30자로 입력해주세요.");
            if (normalized.contains(",")) {
                throw new BusinessException(400, "특징 태그에는 쉼표를 사용할 수 없습니다.");
            }
            uniqueTags.add(normalized);
        }
        if (uniqueTags.size() > 5) {
            throw new BusinessException(400, "특징 태그는 최대 5개까지 입력할 수 있습니다.");
        }
        return new ArrayList<>(uniqueTags);
    }

    private BigDecimal[] normalizeCoordinates(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null && longitude == null) {
            return new BigDecimal[] {null, null};
        }
        if (latitude == null || longitude == null) {
            throw new BusinessException(400, "위도와 경도를 함께 보내주세요.");
        }
        if (latitude.compareTo(BigDecimal.valueOf(-90)) < 0
                || latitude.compareTo(BigDecimal.valueOf(90)) > 0
                || longitude.compareTo(BigDecimal.valueOf(-180)) < 0
                || longitude.compareTo(BigDecimal.valueOf(180)) > 0) {
            throw new BusinessException(400, "위치 좌표가 올바르지 않습니다.");
        }
        return new BigDecimal[] {
            latitude.setScale(5, RoundingMode.HALF_UP),
            longitude.setScale(5, RoundingMode.HALF_UP)
        };
    }

    private String toTagValue(List<String> tags) {
        return String.join(",", tags);
    }

    private int calculateLevel(int catCount) {
        if (catCount >= 30) {
            return 5;
        }
        if (catCount >= 16) {
            return 4;
        }
        if (catCount >= 12) {
            return 3;
        }
        if (catCount >= 5) {
            return 2;
        }
        return catCount >= 1 ? 1 : 0;
    }

    private String toVectorLiteral(List<Double> embedding) {
        StringBuilder value = new StringBuilder("[");
        for (int i = 0; i < embedding.size(); i++) {
            if (i > 0) {
                value.append(',');
            }
            value.append(embedding.get(i));
        }
        return value.append(']').toString();
    }

}
