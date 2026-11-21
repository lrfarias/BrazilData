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
                sb.append("&dataInicial=")
                        .append(URLEncoder.encode(dataInicial.trim(), StandardCharsets.UTF_8));
            }
            if (dataFinal != null && !dataFinal.isBlank()) {
                sb.append("&dataFinal=")
                        .append(URLEncoder.encode(dataFinal.trim(), StandardCharsets.UTF_8));
            }
            url = sb.toString();
        }

        return fetchComCache("sgs:" + url, url, TTL_SGS);
    }

    /**
     * Busca as cotações PTAX (dólar) dos últimos 10 dias na API Olinda do BCB.
     */
    public String buscarPtaxRecente() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM-dd-yyyy");
        LocalDate hoje = LocalDate.now();
        String ini = hoje.minusDays(10).format(fmt);
        String fim = hoje.format(fmt);

        String url = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/"
                + "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)"
                + "?@dataInicial='" + ini + "'&@dataFinalCotacao='" + fim + "'"
                + "&$top=100&$orderby=dataHoraCotacao%20desc&$format=json";

        return fetchComCache("ptax:" + ini + ":" + fim, url, TTL_PTAX);
    }

    private String fetchComCache(String chave, String url, Duration ttl) {
        Instant agora = Instant.now();
        CacheEntry existente = cache.get(chave);
        if (existente != null && existente.expiresAt().isAfter(agora)) {
            return existente.payload();
        }

        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("Accept", "application/json")
                    .header("User-Agent", "BrasilEmDados/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String body = response.body();
                cache.put(chave, new CacheEntry(body, agora.plus(ttl)));
                return body;
            }
            throw new IllegalStateException("BCB respondeu com status " + response.statusCode());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            if (existente != null) {
                return existente.payload();
            }
            throw new IllegalStateException("Requisição ao BCB interrompida.", e);
        } catch (Exception e) {
            if (existente != null) {
                return existente.payload();
            }
            throw new IllegalStateException("Falha ao consultar o BCB.", e);
        }
    }
}
