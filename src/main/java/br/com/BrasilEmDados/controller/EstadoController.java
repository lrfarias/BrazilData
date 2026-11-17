package br.com.BrasilEmDados.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import br.com.BrasilEmDados.model.Estado;
import br.com.BrasilEmDados.service.EstadoService;

@RestController
@RequestMapping("/api/estados")
public class EstadoController {

    private final EstadoService service;

    public EstadoController(EstadoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Estado> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping
    public Estado salvar(@RequestBody Estado estado) {
        return service.salvar(estado);
    }
}