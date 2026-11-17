package br.com.BrasilEmDados.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.BrasilEmDados.model.Estado;

public interface EstadoRepository extends JpaRepository<Estado, Long> {

    boolean existsBySigla(String sigla);

    Optional<Estado> findByNomeIgnoreCase(String nome);

    Optional<Estado> findBySiglaIgnoreCase(String sigla);

}