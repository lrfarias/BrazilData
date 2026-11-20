package br.com.BrasilEmDados.dto;

import java.time.Instant;
import java.util.Map;

public record CotacaoCambioResponse(
        String base,
        Instant atualizadoEm,
        String fonte,
        Map<String, Double> rates) {
}