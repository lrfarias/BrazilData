package br.com.BrasilEmDados.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
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
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (compatible; BrasilEmDados/1.4; +https://brasilemdadosp.com)");
            headers.set("Accept", "application/json");

            ResponseEntity<String> resp = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            String body = resp.getBody();
            if (body != null && !body.isBlank()) {
                cache.put(key, new CacheEntry(body, Instant.now().plusSeconds(ttlSeconds)));
                return body;
            }
        } catch (Exception e) {
            if (entry != null) {
                return entry.payload();
            }
            throw new RuntimeException("Falha ao consultar API externa: " + url, e);
        }

        return entry != null ? entry.payload() : "{}";
    }
}