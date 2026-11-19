package br.com.BrasilEmDados.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import br.com.BrasilEmDados.model.Estado;
import br.com.BrasilEmDados.repository.EstadoRepository;

@Configuration
public class CargaInicialEstados {

    @Bean
    @Order(1)
    CommandLineRunner carregarEstados(EstadoRepository repository) {
        return args -> {

            Estado[] estados = {
                    new Estado("Acre", "AC", "Norte"),
                    new Estado("Alagoas", "AL", "Nordeste"),
                    new Estado("Amapá", "AP", "Norte"),
                    new Estado("Amazonas", "AM", "Norte"),
                    new Estado("Bahia", "BA", "Nordeste"),
                    new Estado("Ceará", "CE", "Nordeste"),
                    new Estado("Distrito Federal", "DF", "Centro-Oeste"),
                    new Estado("Espírito Santo", "ES", "Sudeste"),
                    new Estado("Goiás", "GO", "Centro-Oeste"),
                    new Estado("Maranhão", "MA", "Nordeste"),
                    new Estado("Mato Grosso", "MT", "Centro-Oeste"),
                    new Estado("Mato Grosso do Sul", "MS", "Centro-Oeste"),
                    new Estado("Minas Gerais", "MG", "Sudeste"),
                    new Estado("Pará", "PA", "Norte"),
                    new Estado("Paraíba", "PB", "Nordeste"),
                    new Estado("Paraná", "PR", "Sul"),
                    new Estado("Pernambuco", "PE", "Nordeste"),
                    new Estado("Piauí", "PI", "Nordeste"),
                    new Estado("Rio de Janeiro", "RJ", "Sudeste"),
                    new Estado("Rio Grande do Norte", "RN", "Nordeste"),
                    new Estado("Rio Grande do Sul", "RS", "Sul"),
                    new Estado("Rondônia", "RO", "Norte"),
                    new Estado("Roraima", "RR", "Norte"),
                    new Estado("Santa Catarina", "SC", "Sul"),
                    new Estado("São Paulo", "SP", "Sudeste"),
                    new Estado("Sergipe", "SE", "Nordeste"),
                    new Estado("Tocantins", "TO", "Norte")
            };

            for (Estado estado : estados) {
                if (!repository.existsBySigla(estado.getSigla())) {
                    repository.save(estado);
                }
            }

            System.out.println("Carga inicial dos estados concluída!");
        };
    }
}