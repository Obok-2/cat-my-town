package com.catmytown.server.app.camera;

import com.catmytown.server.common.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

// 내부 vision 서버(FastAPI)에 사진을 보내 고양이 여부를 판별하고, 고양이만 잘라낸 이미지를 받는다.
@Slf4j
@Service
public class VisionClient {

    private RestClient restClient;

    @Value("${vision.url}")
    private String url;

    @PostConstruct
    public void init() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(30));
        restClient = RestClient.builder().requestFactory(factory).build();
    }

    public VisionResult analyze(byte[] photoBytes, String contentType) {
        // 파일 이름이 있어야 vision(FastAPI)이 파일 업로드로 받는다
        ByteArrayResource photoResource = new ByteArrayResource(photoBytes) {
            @Override
            public String getFilename() {
                return "photo";
            }
        };
        HttpHeaders partHeaders = new HttpHeaders();
        partHeaders.setContentType(MediaType.parseMediaType(contentType));
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("photo", new HttpEntity<>(photoResource, partHeaders));

        try {
            JsonNode response = restClient.post()
                    .uri(url + "/analyze")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            return readResult(response);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new BusinessException(400, "올바른 이미지 파일이 아닙니다.");
            }
            log.warn("vision 서버 요청 거절: {}", e.getStatusCode());
            throw new BusinessException(503, "이미지 판별 서비스를 사용할 수 없습니다.");
        } catch (RestClientException | IllegalStateException | IllegalArgumentException e) {
            log.warn("vision 서버 호출 실패", e);
            throw new BusinessException(503, "이미지 판별 서비스를 사용할 수 없습니다.");
        }
    }

    private VisionResult readResult(JsonNode response) {
        if (response == null || !response.has("isCat")) {
            throw new IllegalStateException("vision 응답 형식이 올바르지 않습니다.");
        }
        boolean cat = response.path("isCat").asBoolean(false);
        String label = response.path("label").asText("");
        double confidence = response.path("confidence").asDouble(0);
        if (!cat) {
            return new VisionResult(false, label, confidence, null);
        }

        String image = response.path("image").asText("");
        if (image.isEmpty()) {
            throw new IllegalStateException("vision 응답에 잘라낸 이미지가 없습니다.");
        }
        return new VisionResult(true, label, confidence, Base64.getDecoder().decode(image));
    }

}
