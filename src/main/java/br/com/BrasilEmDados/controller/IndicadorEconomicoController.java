
package br.com.BrasilEmDados.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import br.com.BrasilEmDados.model.IndicadorEconomico;
import br.com.BrasilEmDados.service.IndicadorEconomicoService;

@RestController
@RequestMapping("/api/indicadores")
public class IndicadorEconomicoController {

    private final IndicadorEconomicoService service;

    public IndicadorEconomicoController(IndicadorEconomicoService service) {
        this.service = service;
    }

    @GetMapping
    public List<IndicadorEconomico> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping
    public IndicadorEconomico salvar(@RequestBody IndicadorEconomico indicador) {
        return service.salvar(indicador);
    }

    @GetMapping("/estado/{sigla}")
    public List<IndicadorEconomico> listarPorEstado(
            @PathVariable String sigla) {

        return service.listarPorEstado(sigla.toUpperCase());
    }

    @GetMapping("/comparar")
    public br.com.BrasilEmDados.dto.ComparacaoEstadosDTO compararEstados(
            @RequestParam String uf1,
            @RequestParam String uf2) {
        return service.compararEstados(uf1, uf2);
    }

}
