package br.com.BrasilEmDados.dto;

import java.math.BigDecimal;

public record PibEstadualDTO(
        String codigoIbge,
        String nomeEstado,
        int ano,
        BigDecimal valorPibMilReais) {
}