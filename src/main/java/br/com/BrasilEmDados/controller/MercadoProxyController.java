package br.com.BrasilEmDados.controller;

import br.com.BrasilEmDados.service.MercadoCacheService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MercadoProxyController {

    private final MercadoCacheService cacheService;

    public MercadoProxyController(MercadoCacheService cacheService) {
        this.cacheService = cacheService;
    }

    @GetMapping(value = "/mercado/cambio-live", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getCambioLive(
            @RequestParam(defaultValue = "USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL") String pares) {

        String paresLimpos = pares.replaceAll("[^A-Za-z,-]", "");
        String awesomeUrl = "https://economia.awesomeapi.com.br/json/last/" + paresLimpos;

        try {
            String json = cacheService.getOrFetch("cambio:" + paresLimpos, awesomeUrl, 60);
            return ResponseEntity.ok(json);
        } catch (Exception e) {
            // Fallback gratuito e sem bloqueio de nuvem (taxas base BRL)
            String fallbackUrl = "https://open.er-api.com/v6/latest/BRL";
            String json = cacheService.getOrFetch("cambio:fallback:BRL", fallbackUrl, 300);
            return ResponseEntity.ok(json);
        }
    }

    @GetMapping(value = "/bcb/serie/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getSerieBcb(
            @PathVariable int id,
            @RequestParam(defaultValue = "24") int ultimos) {

        int qtd = Math.max(1, Math.min(ultimos, 360));
        String url = String.format(
                "https://api.bcb.gov.br/dados/serie/bcdata.sgs.%d/dados/ultimos/%d?formato=json",
                id, qtd);
        String json = cacheService.getOrFetch("bcb:" + id + ":" + qtd, url, 43200);
        return ResponseEntity.ok(json);
    }
}