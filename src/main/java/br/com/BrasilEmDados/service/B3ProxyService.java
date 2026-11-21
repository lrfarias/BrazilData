package br.com.BrasilEmDados.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class B3ProxyService {

    private static final Duration TTL_COTACAO = Duration.ofSeconds(60);
    private static final Duration TTL_HISTORICO = Duration.ofMinutes(10);
    private static final Set<String> RANGES_VALIDOS = Set.of("1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y");

    @Value("${brasilemdados.b3.token:}")
    private String token;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(String payload, Instant expiresAt) {
    }

    private String limparSimbolo(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Ticker inválido.");
        }
        String limpo = raw.trim().toUpperCase().replaceAll("[^A-Z0-9.^]", "");
        if (limpo.isEmpty()) {
            throw new IllegalArgumentException("Ticker inválido.");
        }
        return limpo.replace(".SA", "");
    }

    public String buscarHistorico(String tickerRaw, String range, String interval) {
        String simbolo = limparSimbolo(tickerRaw);
        String r = (range != null && RANGES_VALIDOS.contains(range)) ? range : "3mo";
        Duration ttl = ("1d".equals(r) || "5d".equals(r)) ? TTL_COTACAO : TTL_HISTORICO;
        String chave = "b3:" + simbolo + ":" + r;

        CacheEntry existente = cache.get(chave);
        Instant agora = Instant.now();
        if (existente != null && agora.isBefore(existente.expiresAt())) {
            return existente.payload();
        }

        // 1. Brapi (com token se configurado, ou teste público)
        try {
            StringBuilder url = new StringBuilder("https://brapi.dev/api/quote/")
                    .append(URLEncoder.encode(simbolo, StandardCharsets.UTF_8))
                    .append("?range=").append(r).append("&interval=1d");
            if (token != null && !token.isBlank()) {
                url.append("&token=").append(URLEncoder.encode(token.trim(), StandardCharsets.UTF_8));
            }
            String body = requisitarGet(url.toString(), "application/json");
            if (body != null && body.contains("\"regularMarketPrice\"")) {
                cache.put(chave, new CacheEntry(body, agora.plus(ttl)));
                return body;
            }
        } catch (Exception ignored) {
        }

        // 2. Stooq CSV
        try {
            String stooqCode = "^BVSP".equals(simbolo) ? "^ibov" : simbolo.toLowerCase() + ".sa";
            String urlStooq = "https://stooq.com/q/d/l/?s=" + URLEncoder.encode(stooqCode, StandardCharsets.UTF_8)
                    + "&i=d";
            String csv = requisitarGet(urlStooq, "text/csv,*/*");
            if (csv != null && csv.contains("Date,Open,High,Low,Close")) {
                String payload = "{\"csv\":" + jsonEscape(csv) + "}";
                cache.put(chave, new CacheEntry(payload, agora.plus(ttl)));
                return payload;
            }
        } catch (Exception ignored) {
        }

        if (existente != null) {
            return existente.payload();
        }
        throw new RuntimeException("Fonte de cotações B3 indisponível ou exigindo token.");
    }

    private String requisitarGet(String url, String accept) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", accept)
                .header("User-Agent", "BrasilEmDados/1.0")
                .GET()
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 200 && resp.statusCode() < 300 && resp.body() != null && !resp.body().isBlank()) {
            return resp.body();
        }
        return null;
    }

    private String jsonEscape(String s) {
        return "\"" + s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "")
                .replace("\n", "\\n") + "\"";
    }
}