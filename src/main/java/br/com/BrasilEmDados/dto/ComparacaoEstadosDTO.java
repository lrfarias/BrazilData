package br.com.BrasilEmDados.dto;

import br.com.BrasilEmDados.model.IndicadorEconomico;
import java.util.List;

public record ComparacaoEstadosDTO(
        String estado1,
        List<IndicadorEconomico> indicadoresEstado1,
        String estado2,
        List<IndicadorEconomico> indicadoresEstado2) {
}