package br.com.BrasilEmDados.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MercadoCacheService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(String payload, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    public String getOrFetch(String key, String url, long ttlSeconds) {
        CacheEntry entry = cache.get(key);
        if (entry != null && !entry.isExpired()) {
            return entry.payload();
        }

        try {
            String response = restTemplate.getForObject(url, String.class);
            if (response != null && !response.isBlank()) {
                cache.put(key, new CacheEntry(response, Instant.now().plusSeconds(ttlSeconds)));
                return response;
            }
        } catch (Exception e) {
            // Se a API externa cair, devolve o último cache válido em vez de quebrar a tela
            if (entry != null) {
                return entry.payload();
            }
            throw new RuntimeException("Falha ao consultar API externa: " + url, e);
        }

        return entry != null ? entry.payload() : "[]";
    }
}