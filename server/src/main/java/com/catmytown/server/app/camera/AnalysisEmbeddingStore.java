package com.catmytown.server.app.camera;

import com.catmytown.server.common.BusinessException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class AnalysisEmbeddingStore {

    private static final Duration EXPIRATION = Duration.ofMinutes(30);

    private final ConcurrentHashMap<String, Entry> entries = new ConcurrentHashMap<>();

    public String save(Long userId, List<Double> embedding) {
        removeExpired();
        String analysisId = UUID.randomUUID().toString();
        entries.put(analysisId, new Entry(userId, List.copyOf(embedding), Instant.now().plus(EXPIRATION)));
        return analysisId;
    }

    public List<Double> get(String analysisId, Long userId) {
        Entry entry = entries.get(analysisId);
        if (entry == null || entry.expiresAt().isBefore(Instant.now()) || !entry.userId().equals(userId)) {
            entries.remove(analysisId);
            throw new BusinessException(400, "사진 분석 결과가 만료되었습니다. 다시 촬영해주세요.");
        }
        return entry.embedding();
    }

    public void remove(String analysisId, Long userId) {
        if (analysisId == null || analysisId.isBlank()) {
            return;
        }
        Entry entry = entries.get(analysisId);
        if (entry != null && entry.userId().equals(userId)) {
            entries.remove(analysisId);
        }
    }

    private void removeExpired() {
        Instant now = Instant.now();
        entries.entrySet().removeIf(item -> item.getValue().expiresAt().isBefore(now));
    }

    private record Entry(Long userId, List<Double> embedding, Instant expiresAt) {
    }

}
