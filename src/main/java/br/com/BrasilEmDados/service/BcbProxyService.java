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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BcbProxyService {

    private static final Duration TTL_SGS = Duration.ofHours(6);
    private static final Duration TTL_PTAX = Duration.ofMinutes(15);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(String payload, Instant expiresAt) {
    }

    /**
     * Busca séries oficiais do SGS (ex.: 433 IPCA mensal, 13522 IPCA 12m, 189
     * IGP-M,
     * 1619 Salário Mínimo, 13762 Dívida Bruta/PIB, 4513 Dívida Líquida/PIB).
     */
    public String buscarSerieSgs(int codigo, Integer ultimos, String dataInicial, String dataFinal) {
        if (codigo <= 0) {
            throw new IllegalArgumentException("Código de série SGS inválido.");
        }

        String url;
        if (ultimos != null && ultimos > 0) {
            int limite = Math.min(ultimos, 360);
            url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs." + codigo
                    + "/dados/ultimos/" + limite + "?formato=json";
        } else {
            StringBuilder sb = new StringBuilder("https://api.bcb.gov.br/dados/serie/bcdata.sgs.")
                    .append(codigo).append("/dados?formato=json");
            if (dataInicial != null && !dataInicial.isBlank()) {
                sb.append("&dataInicial=").append(URLEncoder.encode(dataInicial, StandardCharsets.UTF_8));
            }
            if (dataFinal != null && !dataFinal.isBlank()) {
                sb.append("&dataFinal=").append(URLEncoder.encode(dataFinal, StandardCharsets.UTF_8));
            }
            url = sb.toString();
        }

        return fetchComCache("sgs:" + url, url, TTL_SGS);
    }

    /**
     * Busca a cotação oficial PTAX (Dólar) nos últimos 10 dias via API Olinda do
     * BCB.
     * A janela de 10 dias garante retorno mesmo em fins de semana e feriados.
     */
    public String buscarPtaxRecente() {
        DateTimeFormatter fmtOlinda = DateTimeFormatter.ofPattern("MM-dd-yyyy");
        LocalDate hoje = LocalDate.now();
        String inicio = hoje.minusDays(10).format(fmtOlinda);
        String fim = hoje.format(fmtOlinda);

        String url = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/"
                + "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)"
                + "?@dataInicial='" + inicio + "'&@dataFinalCotacao='" + fim
                + "'&$top=10&$orderby=dataHoraCotacao%20desc&$format=json";

        return fetchComCache("ptax:recente", url, TTL_PTAX);
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
                    .header("User-Agent", "BrasilEmDados/1.0")
                    .GET()
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() >= 200 && resp.statusCode() < 300 && resp.body() != null && !resp.body().isBlank()) {
                cache.put(chave, new CacheEntry(resp.body(), agora.plus(ttl)));
                return resp.body();
            }
            throw new RuntimeException("BCB retornou status " + resp.statusCode());
        } catch (Exception e) {
            // Fallback: se o BCB oscilar, entrega o último dado válido em cache
            if (existente != null) {
                return existente.payload();
            }
            throw new RuntimeException("Falha ao consultar API oficial do Banco Central: " + e.getMessage(), e);
        }
    }
}