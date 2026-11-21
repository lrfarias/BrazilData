package br.com.BrasilEmDados.controller;

import br.com.BrasilEmDados.service.BcbProxyService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bcb")
public class BcbProxyController {

    private final BcbProxyService bcbService;

    public BcbProxyController(BcbProxyService bcbService) {
        this.bcbService = bcbService;
    }

    @GetMapping(value = "/serie/{codigo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> obterSerie(
            @PathVariable int codigo,
            @RequestParam(required = false) Integer ultimos,
            @RequestParam(required = false) String dataInicial,
            @RequestParam(required = false) String dataFinal) {
        try {
            String json = bcbService.buscarSerieSgs(codigo, ultimos, dataInicial, dataFinal);
            return ResponseEntity.ok(json);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("{\"erro\":\"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(502).body("{\"erro\":\"Serviço do Banco Central indisponível no momento.\"}");
        }
    }

    @GetMapping(value = "/ptax", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> obterPtax() {
        try {
            return ResponseEntity.ok(bcbService.buscarPtaxRecente());
        } catch (Exception e) {
            return ResponseEntity.status(502).body("{\"erro\":\"PTAX indisponível no momento.\"}");
        }
    }
}