package br.com.BrasilEmDados.repository;

import br.com.BrasilEmDados.model.Pais;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaisRepository extends JpaRepository<Pais, String> {
    List<Pais> findAllByOrderByNomeAsc();
}