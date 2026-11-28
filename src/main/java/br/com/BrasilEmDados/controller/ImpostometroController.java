package br.com.BrasilEmDados.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class ImpostometroController {

    private static final double META_FALLBACK_ANUAL = 3_900_000_000_000.0;
    private static final long CACHE_SEGUNDOS = 300; // 5 minutos

    private final RestClient restClient = RestClient.builder()
            .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            .build();

    private volatile Map<String, Object> cacheDados = null;
    private volatile Instant ultimaAtualizacao = Instant.EPOCH;

    @GetMapping("/impostometro")
    public Map<String, Object> obterImpostometro() {
        Instant agora = Instant.now();
        if (cacheDados != null && Duration.between(ultimaAtualizacao, agora).getSeconds() < CACHE_SEGUNDOS) {
            // Avança o valor em cache conforme os segundos decorridos
            double valorBase = ((Number) cacheDados.get("valor")).doubleValue();
            double ritmo = ((Number) cacheDados.get("incrementoPorSegundo")).doubleValue();
            double decorrido = Duration.between(ultimaAtualizacao, agora).toMillis() / 1000.0;
            return Map.of(
                    "valor", valorBase + (ritmo * decorrido),
                    "incrementoPorSegundo", ritmo,
                    "ano", LocalDate.now(ZoneId.of("America/Sao_Paulo")).getYear(),
                    "oficial", cacheDados.get("oficial"),
                    "fonte", "Impostômetro (ACSP / IBPT)",
                    "urlFonte", "https://impostometro.com.br/");
        }

        int anoAtual = LocalDate.now(ZoneId.of("America/Sao_Paulo")).getYear();
        try {
            String html = restClient.get()
                    .uri("https://impostometro.com.br/widget/contador/")
                    .retrieve()
                    .body(String.class);

            Double valorExtraido = extrairNumero(html, "\"Valor\"\\s*:\\s*([0-9]+\\.?[0-9]*)");
            Double incrementoExtraido = extrairNumero(html, "\"Incremento\"\\s*:\\s*([0-9]+\\.?[0-9]*)");

            if (valorExtraido != null && valorExtraido > 1_000_000_000.0) {
                double ritmo = (incrementoExtraido != null && incrementoExtraido > 0)
                        ? incrementoExtraido
                        : calcularRitmoFallback(anoAtual);

                cacheDados = Map.of(
                        "valor", valorExtraido,
                        "incrementoPorSegundo", ritmo,
                        "ano", anoAtual,
                        "oficial", true,
                        "fonte", "Impostômetro (ACSP / IBPT)",
                        "urlFonte", "https://impostometro.com.br/");
                ultimaAtualizacao = agora;
                return cacheDados;
            }
        } catch (Exception ignored) {
            // Cai silenciosamente para o fallback abaixo
        }

        return gerarFallback(anoAtual);
    }

    private Double extrairNumero(String texto, String regex) {
        if (texto == null)
            return null;
        Matcher m = Pattern.compile(regex, Pattern.CASE_INSENSITIVE).matcher(texto);
        return m.find() ? Double.parseDouble(m.group(1)) : null;
    }

    private double calcularRitmoFallback(int ano) {
        ZoneId sp = ZoneId.of("America/Sao_Paulo");
        Instant inicio = LocalDate.of(ano, 1, 1).atStartOfDay(sp).toInstant();
        Instant fim = LocalDate.of(ano + 1, 1, 1).atStartOfDay(sp).toInstant();
        return META_FALLBACK_ANUAL / Duration.between(inicio, fim).getSeconds();
    }

    private Map<String, Object> gerarFallback(int ano) {
        ZoneId sp = ZoneId.of("America/Sao_Paulo");
        Instant inicio = LocalDate.of(ano, 1, 1).atStartOfDay(sp).toInstant();
        double ritmo = calcularRitmoFallback(ano);
        double valor = Duration.between(inicio, Instant.now()).getSeconds() * ritmo;

        return Map.of(
                "valor", valor,
                "incrementoPorSegundo", ritmo,
                "ano", ano,
                "oficial", false,
                "fonte", "Estimativa Linear • Ref. Impostômetro (ACSP / IBPT)",
                "urlFonte", "https://impostometro.com.br/");
    }
}