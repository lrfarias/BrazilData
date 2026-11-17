package br.com.BrasilEmDados.controller;

import org.springframework.web.bind.annotation.*;
import br.com.BrasilEmDados.service.AssistenteEconomicoService;

@RestController
@RequestMapping("/api/assistente")
public class AssistenteEconomicoController {

    private final AssistenteEconomicoService service;

    public AssistenteEconomicoController(AssistenteEconomicoService service) {
        this.service = service;
    }

    @GetMapping("/perguntar")
    public String perguntar(
            @RequestParam String pergunta,
            @RequestParam(required = false) String uf) {
        return service.perguntar(pergunta, uf);
    }
}