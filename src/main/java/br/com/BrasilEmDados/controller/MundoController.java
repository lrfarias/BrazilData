package br.com.BrasilEmDados.controller;

import br.com.BrasilEmDados.model.Pais;
import br.com.BrasilEmDados.repository.PaisRepository;
import br.com.BrasilEmDados.service.MundoSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mundo")
@CrossOrigin(origins = "*")
public class MundoController {

    private final PaisRepository paisRepository;
    private final MundoSyncService syncService;

    public MundoController(PaisRepository paisRepository, MundoSyncService syncService) {
        this.paisRepository = paisRepository;
        this.syncService = syncService;
    }

    @GetMapping("/paises")
    public List<Pais> listarPaises() {
        return paisRepository.findAllByOrderByNomeAsc();
    }

    @GetMapping("/paises/{iso3}")
    public ResponseEntity<Pais> buscarPais(@PathVariable String iso3) {
        return paisRepository.findById(iso3.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/sincronizar")
    public Map<String, Object> sincronizarAgora() {
        int total = syncService.sincronizarTudo();
        return Map.of("status", "ok", "paisesSincronizados", total);
    }
}