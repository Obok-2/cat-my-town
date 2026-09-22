package com.catmytown.server.app.camera;

import com.catmytown.server.common.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Service
public class VoyageImageEmbeddingClient {

    private final RestClient restClient = RestClient.create();

    @Value("${camera.voyage.api-key}")
    private String apiKey;

    @Value("${camera.voyage.model}")
    private String model;

    @Value("${camera.voyage.url}")
    private String url;

    public List<Double> createQueryEmbedding(byte[] photoBytes, String contentType) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BusinessException(503, "고양이 개체 매칭 서비스를 사용할 수 없습니다.");
        }

        Map<String, Object> image = new LinkedHashMap<>();
        image.put("type", "image_base64");
        image.put("image_base64", "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(photoBytes));

        Map<String, Object> input = new LinkedHashMap<>();
        input.put("content", List.of(image));

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("inputs", List.of(input));
        request.put("model", model);
        request.put("input_type", "query");
        request.put("truncation", false);

        try {
            JsonNode response = restClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);
            return readEmbedding(response);
        } catch (RestClientException | IllegalStateException e) {
            log.warn("Voyage 이미지 임베딩 호출 실패", e);
            throw new BusinessException(503, "고양이 개체 매칭 서비스를 사용할 수 없습니다.");
        }
    }

    private List<Double> readEmbedding(JsonNode response) {
        JsonNode values = response == null ? null : response.path("data").path(0).path("embedding");
        if (values == null || !values.isArray() || values.size() != 1024) {
            throw new IllegalStateException("Voyage 임베딩 응답 형식이 올바르지 않습니다.");
        }
        List<Double> embedding = new ArrayList<>(values.size());
        for (JsonNode value : values) {
            embedding.add(value.doubleValue());
        }
        return embedding;
    }

}
