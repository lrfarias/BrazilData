package br.com.BrasilEmDados.controller;

import br.com.BrasilEmDados.dto.CotacaoCambioResponse;
import br.com.BrasilEmDados.service.CambioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cambio")
@CrossOrigin(origins = "*")
public class CambioController {

    private final CambioService cambioService;

    public CambioController(CambioService cambioService) {
        this.cambioService = cambioService;
    }

    @GetMapping("/cotacoes")
    public ResponseEntity<CotacaoCambioResponse> cotacoes() {
        return ResponseEntity.ok(cambioService.obterCotacoesUsd());
    }
}