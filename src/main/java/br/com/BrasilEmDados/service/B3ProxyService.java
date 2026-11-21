package br.com.BrasilEmDados.service;

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
    private static final Set<String> INTERVALS_VALIDOS = Set.of("5m", "15m", "30m", "1h", "1d", "1wk", "1mo");

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(String payload, Instant expiresAt) {
    }

    /**
     * Normaliza tickers da B3: PETR4 -> PETR4.SA | ^BVSP -> ^BVSP
     */
    private String normalizarTicker(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Ticker inválido.");
        }
        String limpo = raw.trim().toUpperCase().replaceAll("[^A-Z0-9.^]", "");
        if (limpo.isEmpty()) {
            throw new IllegalArgumentException("Ticker inválido.");
        }
        if (limpo.startsWith("^") || limpo.endsWith(".SA")) {
            return limpo;
        }
        return limpo + ".SA";
    }

    /**
     * Busca dados de pregão e série histórica (Abertura, Fechamento, Máxima, Mínima
     * e Volume)
     */
    public String buscarHistorico(String tickerRaw, String range, String interval) {
        String ticker = normalizarTicker(tickerRaw);
        String r = (range != null && RANGES_VALIDOS.contains(range)) ? range : "3mo";
        String i = (interval != null && INTERVALS_VALIDOS.contains(interval)) ? interval : "1d";

        String encodedTicker = URLEncoder.encode(ticker, StandardCharsets.UTF_8);
        String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodedTicker
                + "?range=" + r + "&interval=" + i + "&includePrePost=false";

        Duration ttl = ("1d".equals(r) || "5d".equals(r)) ? TTL_COTACAO : TTL_HISTORICO;
        return fetchComCache("b3:" + ticker + ":" + r + ":" + i, url, ttl);
    }

    private String fetchComCache(String chave, String url, Duration ttl) {
        CacheEntry existente = cache.get(chave);
        Instant agora = Instant.now();

        if (existente != null && agora.isBefore(existente.expiresAt())) {
            return existente.payload();
        }

        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(12))
                    .header("Accept", "application/json")
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) BrasilEmDados/1.0")
                    .GET()
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() >= 200 && resp.statusCode() < 300 && resp.body() != null && !resp.body().isBlank()) {
                cache.put(chave, new CacheEntry(resp.body(), agora.plus(ttl)));
                return resp.body();
            }
            throw new RuntimeException("Fonte B3 retornou status " + resp.statusCode());
        } catch (Exception e) {
            if (existente != null) {
                return existente.payload();
            }
            throw new RuntimeException("Falha ao consultar dados da B3: " + e.getMessage(), e);
        }
    }
}