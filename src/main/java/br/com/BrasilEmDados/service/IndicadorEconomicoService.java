package br.com.BrasilEmDados.service;

import java.util.List;
import org.springframework.stereotype.Service;
import br.com.BrasilEmDados.dto.ComparacaoEstadosDTO;
import br.com.BrasilEmDados.model.IndicadorEconomico;
import br.com.BrasilEmDados.repository.IndicadorEconomicoRepository;

@Service
public class IndicadorEconomicoService {

    private final IndicadorEconomicoRepository repository;

    public IndicadorEconomicoService(IndicadorEconomicoRepository repository) {
        this.repository = repository;
    }

    public List<IndicadorEconomico> listarTodos() {
        return repository.findAll();
    }

    public IndicadorEconomico salvar(IndicadorEconomico indicador) {
        return repository.save(indicador);
    }

    public List<IndicadorEconomico> listarPorEstado(String sigla) {
        return repository.findByEstado_Sigla(sigla.toUpperCase());
    }

    public ComparacaoEstadosDTO compararEstados(String sigla1, String sigla2) {
        String uf1 = sigla1.toUpperCase();
        String uf2 = sigla2.toUpperCase();
        return new ComparacaoEstadosDTO(
                uf1, repository.findByEstado_Sigla(uf1),
                uf2, repository.findByEstado_Sigla(uf2));
    }
}