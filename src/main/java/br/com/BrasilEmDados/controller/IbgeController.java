package br.com.BrasilEmDados.controller;

import br.com.BrasilEmDados.dto.PibEstadualDTO;
import br.com.BrasilEmDados.model.IndicadorEconomico;
import br.com.BrasilEmDados.service.IbgePibService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ibge")
public class IbgeController {

    private final IbgePibService service;

    public IbgeController(IbgePibService service) {
        this.service = service;
    }

    @GetMapping("/pib/{ano}")
    public List<PibEstadualDTO> consultarPib(@PathVariable int ano) {
        return service.consultarPibEstadual(ano);
    }

    @GetMapping("/populacao/{ano}")
    public List<IndicadorEconomico> sincronizarPopulacao(@PathVariable int ano) {
        return service.sincronizarPopulacaoEPibPerCapita(ano);
    }

}