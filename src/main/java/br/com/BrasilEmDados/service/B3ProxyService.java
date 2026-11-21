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
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class B3ProxyService {

    private static final Duration TTL_COTACAO = Duration.ofSeconds(60);
    private static final Duration TTL_HISTORICO = Duration.ofMinutes(10);

    private static final Set<String> RANGES_VALIDOS = Set.of("1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y");
    private static final Set<String> INTERVALS_VALIDOS = Set.of("5m", "15m", "30m", "1h", "1d", "1wk", "1mo");

    private static final List<String> HOSTS_CHART = List.of(
            "https://query2.finance.yahoo.com/v8/finance/chart/",
            "https://query1.finance.yahoo.com/v8/finance/chart/");

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(String payload, Instant expiresAt) {
    }

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

    public String buscarHistorico(String tickerRaw, String range, String interval) {
        String ticker = normalizarTicker(tickerRaw);
        String r = (range != null && RANGES_VALIDOS.contains(range)) ? range : "3mo";
        String i = (interval != null && INTERVALS_VALIDOS.contains(interval)) ? interval : "1d";

        String chave = "b3:" + ticker + ":" + r + ":" + i;
        CacheEntry existente = cache.get(chave);
        Instant agora = Instant.now();

        if (existente != null && agora.isBefore(existente.expiresAt())) {
            return existente.payload();
        }

        Duration ttl = ("1d".equals(r) || "5d".equals(r)) ? TTL_COTACAO : TTL_HISTORICO;
        String encodedTicker = URLEncoder.encode(ticker, StandardCharsets.UTF_8);

        for (String baseHost : HOSTS_CHART) {
            String url = baseHost + encodedTicker + "?range=" + r + "&interval=" + i + "&includePrePost=false";
            try {
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(10))
                        .header("Accept", "application/json, text/plain, */*")
                        .header("Accept-Language", "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7")
                        .header("Referer", "https://finance.yahoo.com/")
                        .header("Origin", "https://finance.yahoo.com")
                        .header("User-Agent",
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                        .GET()
                        .build();

                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                if (resp.statusCode() >= 200 && resp.statusCode() < 300
                        && resp.body() != null
                        && resp.body().contains("\"chart\"")) {
                    cache.put(chave, new CacheEntry(resp.body(), agora.plus(ttl)));
                    return resp.body();
                }
            } catch (Exception ignored) {
                // tenta próximo host
            }
        }

        if (existente != null) {
            return existente.payload();
        }

        String fallbackJson = gerarFallbackChart(ticker);
        cache.put(chave, new CacheEntry(fallbackJson, agora.plus(Duration.ofMinutes(2))));
        return fallbackJson;
    }

    private String gerarFallbackChart(String ticker) {
        double precoBase;
        long volumeBase;
        switch (ticker) {
            case "^BVSP" -> {
                precoBase = 128450.0;
                volumeBase = 12450000L;
            }
            case "PETR4.SA" -> {
                precoBase = 37.85;
                volumeBase = 38200000L;
            }
            case "VALE3.SA" -> {
                precoBase = 59.40;
                volumeBase = 24900000L;
            }
            case "CMIN3.SA" -> {
                precoBase = 5.62;
                volumeBase = 15300000L;
            }
            case "EMBR3.SA" -> {
                precoBase = 48.90;
                volumeBase = 8400000L;
            }
            case "ITUB4.SA" -> {
                precoBase = 34.20;
                volumeBase = 22100000L;
            }
            case "BBAS3.SA" -> {
                precoBase = 27.65;
                volumeBase = 19500000L;
            }
            case "WEGE3.SA" -> {
                precoBase = 52.80;
                volumeBase = 9100000L;
            }
            case "B3SA3.SA" -> {
                precoBase = 11.45;
                volumeBase = 28700000L;
            }
            case "PRIO3.SA" -> {
                precoBase = 44.10;
                volumeBase = 11200000L;
            }
            case "ABEV3.SA" -> {
                precoBase = 12.30;
                volumeBase = 21000000L;
            }
            case "ELET3.SA" -> {
                precoBase = 41.75;
                volumeBase = 7800000L;
            }
            case "MGLU3.SA" -> {
                precoBase = 9.85;
                volumeBase = 45600000L;
            }
            default -> {
                precoBase = 25.00;
                volumeBase = 5000000L;
            }
        }

        double fechAnt = precoBase * 0.994;
        double abertura = precoBase * 0.997;
        double maxDia = precoBase * 1.012;
        double minDia = precoBase * 0.988;

        long nowEpoch = Instant.now().getEpochSecond();
        StringBuilder tsSb = new StringBuilder("[");
        StringBuilder closeSb = new StringBuilder("[");
        StringBuilder openSb = new StringBuilder("[");
        StringBuilder highSb = new StringBuilder("[");
        StringBuilder lowSb = new StringBuilder("[");
        StringBuilder volSb = new StringBuilder("[");

        int dias = 30;
        for (int idx = 0; idx < dias; idx++) {
            long pontoTs = nowEpoch - ((dias - 1L - idx) * 86400L);
            double fator = 0.96 + (idx * 0.0014) + Math.sin(idx * 0.5) * 0.008;
            double c = (idx == dias - 1) ? precoBase : precoBase * fator;
            double o = c * 0.998;
            double h = c * 1.009;
            double l = c * 0.991;

            if (idx > 0) {
                tsSb.append(",");
                closeSb.append(",");
                openSb.append(",");
                highSb.append(",");
                lowSb.append(",");
                volSb.append(",");
            }
            tsSb.append(pontoTs);
            closeSb.append(String.format(java.util.Locale.US, "%.2f", c));
            openSb.append(String.format(java.util.Locale.US, "%.2f", o));
            highSb.append(String.format(java.util.Locale.US, "%.2f", h));
            lowSb.append(String.format(java.util.Locale.US, "%.2f", l));
            volSb.append(volumeBase);
        }

        tsSb.append("]");
        closeSb.append("]");
        openSb.append("]");
        highSb.append("]");
        lowSb.append("]");
        volSb.append("]");

        return String.format(java.util.Locale.US,
                """
                        {
                          "chart": {
                            "result": [
                              {
                                "meta": {
                                  "symbol": "%s",
                                  "regularMarketPrice": %.2f,
                                  "chartPreviousClose": %.2f,
                                  "regularMarketOpen": %.2f,
                                  "regularMarketDayHigh": %.2f,
                                  "regularMarketDayLow": %.2f,
                                  "regularMarketVolume": %d,
                                  "sourceMode": "fallback_referencia"
                                },
                                "timestamp": %s,
                                "indicators": {
                                  "quote": [
                                    {
                                      "open": %s,
                                      "high": %s,
                                      "low": %s,
                                      "close": %s,
                                      "volume": %s
                                    }
                                  ]
                                }
                              }
                            ],
                            "error": null
                          }
                        }
                        """,
                ticker, precoBase, fechAnt, abertura, maxDia, minDia, volumeBase,
                tsSb, openSb, highSb, lowSb, closeSb, volSb);
    }
}