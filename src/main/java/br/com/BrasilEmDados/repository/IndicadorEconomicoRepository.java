
package br.com.BrasilEmDados.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import br.com.BrasilEmDados.model.Estado;
import br.com.BrasilEmDados.model.IndicadorEconomico;

public interface IndicadorEconomicoRepository
                extends JpaRepository<IndicadorEconomico, Long> {

        List<IndicadorEconomico> findByEstado_Sigla(String sigla);

        Optional<IndicadorEconomico> findByNomeAndAnoReferenciaAndEstado(String nome, Integer anoReferencia,
                        Estado estado);

}
