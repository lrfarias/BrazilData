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
        String i = (interval != null && INTERVALS_VALIDOS.contains(interval)) ? interval : "1d";

        Duration ttl = ("1d".equals(r) || "5d".equals(r)) ? TTL_COTACAO : TTL_HISTORICO;
        String chave = "b3:" + simbolo + ":" + r + ":" + i;

        CacheEntry existente = cache.get(chave);
        if (existente != null && Instant.now().isBefore(existente.expiresAt())) {
            return existente.payload();
        }

        // 1. Tenta Brapi (cotação/resumo B3)
        try {
            String urlBrapi = "https://brapi.dev/api/quote/" + URLEncoder.encode(simbolo, StandardCharsets.UTF_8)
                    + "?range=" + r + "&interval=" + i;
            String body = requisitarGet(urlBrapi, "application/json");
            if (body != null && body.contains("\"regularMarketPrice\"")) {
                cache.put(chave, new CacheEntry(body, Instant.now().plus(ttl)));
                return body;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return fallbackOuErro(existente, simbolo);
        } catch (Exception ignored) {
            // segue para a próxima fonte
        }

        // 2. Tenta Yahoo Finance chart v8 com headers de navegador
        try {
            String tickerYahoo = "^BVSP".equals(simbolo) ? "^BVSP" : simbolo + ".SA";
            String urlYahoo = "https://query1.finance.yahoo.com/v8/finance/chart/"
                    + URLEncoder.encode(tickerYahoo, StandardCharsets.UTF_8)
                    + "?range=" + r + "&interval=" + i + "&includePrePost=false";
            String body = requisitarGet(urlYahoo, "application/json");
            if (body != null && body.contains("\"chart\"")) {
                cache.put(chave, new CacheEntry(body, Instant.now().plus(ttl)));
                return body;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return fallbackOuErro(existente, simbolo);
        } catch (Exception ignored) {
            // segue para a próxima fonte
        }

        // 3. Tenta Stooq CSV histórico diário
        try {
            String stooqCode = "^BVSP".equals(simbolo) ? "^ibov" : simbolo.toLowerCase() + ".sa";
            String urlStooq = "https://stooq.com/q/d/l/?s=" + URLEncoder.encode(stooqCode, StandardCharsets.UTF_8)
                    + "&i=d";
            String csv = requisitarGet(urlStooq, "text/csv,*/*");
            if (csv != null && csv.contains("Date,Open,High,Low,Close")) {
                String payload = "{\"csv\":" + jsonEscape(csv) + "}";
                cache.put(chave, new CacheEntry(payload, Instant.now().plus(ttl)));
                return payload;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception ignored) {
            // nenhuma fonte restante
        }

        return fallbackOuErro(existente, simbolo);
    }

    private String fallbackOuErro(CacheEntry existente, String simbolo) {
        if (existente != null) {
            return existente.payload();
        }
        throw new RuntimeException("Nenhuma fonte externa retornou dados reais para " + simbolo);
    }

    private String requisitarGet(String url, String accept) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(12))
                .header("Accept", accept)
                .header("Accept-Language", "pt-BR,pt;q=0.9,en;q=0.8")
                .header("User-Agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
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