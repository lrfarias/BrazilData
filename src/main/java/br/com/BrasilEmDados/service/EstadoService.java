package br.com.BrasilEmDados.service;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.BrasilEmDados.model.Estado;
import br.com.BrasilEmDados.repository.EstadoRepository;

@Service
public class EstadoService {

    private final EstadoRepository repository;

    public EstadoService(EstadoRepository repository) {
        this.repository = repository;
    }

    public List<Estado> listarTodos() {
        return repository.findAll();
    }

    public Estado salvar(Estado estado) {
        return repository.save(estado);
    }
}