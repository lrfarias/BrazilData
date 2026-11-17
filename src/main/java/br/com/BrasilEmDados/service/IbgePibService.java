package br.com.BrasilEmDados.service;

import br.com.BrasilEmDados.dto.PibEstadualDTO;
import br.com.BrasilEmDados.model.Estado;
import br.com.BrasilEmDados.model.IndicadorEconomico;
import br.com.BrasilEmDados.repository.EstadoRepository;
import br.com.BrasilEmDados.repository.IndicadorEconomicoRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class IbgePibService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final EstadoRepository estadoRepository;
    private final IndicadorEconomicoRepository indicadorRepository;

    // Mapa oficial do código IBGE para a Sigla da UF (imune a erros de acentuação)
    private static final Map<String, String> CODIGO_IBGE_PARA_SIGLA = Map.ofEntries(
            Map.entry("11", "RO"), Map.entry("12", "AC"), Map.entry("13", "AM"),
            Map.entry("14", "RR"), Map.entry("15", "PA"), Map.entry("16", "AP"),
            Map.entry("17", "TO"), Map.entry("21", "MA"), Map.entry("22", "PI"),
            Map.entry("23", "CE"), Map.entry("24", "RN"), Map.entry("25", "PB"),
            Map.entry("26", "PE"), Map.entry("27", "AL"), Map.entry("28", "SE"),
            Map.entry("29", "BA"), Map.entry("31", "MG"), Map.entry("32", "ES"),
            Map.entry("33", "RJ"), Map.entry("35", "SP"), Map.entry("41", "PR"),
            Map.entry("42", "SC"), Map.entry("43", "RS"), Map.entry("50", "MS"),
            Map.entry("51", "MT"), Map.entry("52", "GO"), Map.entry("53", "DF"));

    public IbgePibService(ObjectMapper objectMapper,
            EstadoRepository estadoRepository,
            IndicadorEconomicoRepository indicadorRepository) {
        this.objectMapper = objectMapper;
        this.estadoRepository = estadoRepository;
        this.indicadorRepository = indicadorRepository;
        this.restClient = RestClient.builder().build();
    }

    @Transactional
    public List<PibEstadualDTO> consultarPibEstadual(int ano) {
        try {
            String url = "https://servicodados.ibge.gov.br/api/v3/agregados/5938/periodos/"
                    + ano + "/variaveis/37?localidades=N3%5Ball%5D";

            String respostaJson = restClient.get()
                    .uri(URI.create(url))
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(respostaJson);
            List<PibEstadualDTO> listaPib = new ArrayList<>();

            if (root == null || !root.isArray() || root.isEmpty()) {
                return listaPib;
            }

            JsonNode series = root.get(0)
                    .path("resultados").get(0)
                    .path("series");

            for (JsonNode item : series) {
                String codigoIbge = item.path("localidade").path("id").asString("");
                String nomeEstado = item.path("localidade").path("nome").asString("");
                String valorStr = item.path("serie").path(String.valueOf(ano)).asString("0");

                BigDecimal valorPib = (valorStr != null && valorStr.matches("\\d+(\\.\\d+)?"))
                        ? new BigDecimal(valorStr)
                        : BigDecimal.ZERO;

                listaPib.add(new PibEstadualDTO(codigoIbge, nomeEstado, ano, valorPib));

                String sigla = CODIGO_IBGE_PARA_SIGLA.get(codigoIbge);
                if (sigla != null && valorPib.compareTo(BigDecimal.ZERO) > 0) {
                    Optional<Estado> estadoOpt = estadoRepository.findBySiglaIgnoreCase(sigla);

                    if (estadoOpt.isPresent()) {
                        Estado estado = estadoOpt.get();

                        IndicadorEconomico indicador = indicadorRepository
                                .findByNomeAndAnoReferenciaAndEstado("PIB Estadual", ano, estado)
                                .orElse(new IndicadorEconomico());

                        indicador.setNome("PIB Estadual");
                        indicador.setValor(valorPib);
                        indicador.setAnoReferencia(ano);
                        indicador.setUnidade("Mil Reais");
                        indicador.setFonte("IBGE");
                        indicador.setEstado(estado);

                        indicadorRepository.save(indicador);
                    }
                }
            }

            return listaPib;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao consultar e salvar PIB do IBGE: " + e.getMessage(), e);
        }
    }

    @Transactional
    public List<IndicadorEconomico> sincronizarPopulacaoEPibPerCapita(int ano) {
        try {
            String url = "https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/"
                    + ano + "/variaveis/9324?localidades=N3%5Ball%5D";

            String respostaJson = restClient.get()
                    .uri(URI.create(url))
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(respostaJson);
            List<IndicadorEconomico> salvos = new ArrayList<>();

            if (root == null || !root.isArray() || root.isEmpty()) {
                return salvos;
            }

            JsonNode series = root.get(0).path("resultados").get(0).path("series");

            for (JsonNode item : series) {
                String codigoIbge = item.path("localidade").path("id").asString("");
                String valorStr = item.path("serie").path(String.valueOf(ano)).asString("0");

                BigDecimal populacao = (valorStr != null && valorStr.matches("\\d+(\\.\\d+)?"))
                        ? new BigDecimal(valorStr)
                        : BigDecimal.ZERO;

                String sigla = CODIGO_IBGE_PARA_SIGLA.get(codigoIbge);
                if (sigla != null && populacao.compareTo(BigDecimal.ZERO) > 0) {
                    Optional<Estado> estadoOpt = estadoRepository.findBySiglaIgnoreCase(sigla);

                    if (estadoOpt.isPresent()) {
                        Estado estado = estadoOpt.get();

                        // 1. Salva a População
                        IndicadorEconomico indPop = indicadorRepository
                                .findByNomeAndAnoReferenciaAndEstado("População", ano, estado)
                                .orElse(new IndicadorEconomico());
                        indPop.setNome("População");
                        indPop.setValor(populacao);
                        indPop.setAnoReferencia(ano);
                        indPop.setUnidade("Habitantes");
                        indPop.setFonte("IBGE");
                        indPop.setEstado(estado);
                        salvos.add(indicadorRepository.save(indPop));

                        // 2. Calcula e salva o PIB per capita se houver PIB salvo para este ano
                        Optional<IndicadorEconomico> pibOpt = indicadorRepository
                                .findByNomeAndAnoReferenciaAndEstado("PIB Estadual", ano, estado);

                        if (pibOpt.isPresent()) {
                            BigDecimal pibReais = pibOpt.get().getValor().multiply(new BigDecimal("1000"));
                            BigDecimal pibPerCapita = pibReais.divide(populacao, 2, RoundingMode.HALF_UP);

                            IndicadorEconomico indPerCapita = indicadorRepository
                                    .findByNomeAndAnoReferenciaAndEstado("PIB per capita", ano, estado)
                                    .orElse(new IndicadorEconomico());
                            indPerCapita.setNome("PIB per capita");
                            indPerCapita.setValor(pibPerCapita);
                            indPerCapita.setAnoReferencia(ano);
                            indPerCapita.setUnidade("R$");
                            indPerCapita.setFonte("IBGE (Cálculo Derivado)");
                            indPerCapita.setEstado(estado);
                            salvos.add(indicadorRepository.save(indPerCapita));
                        }
                    }
                }
            }
            return salvos;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao sincronizar população do IBGE: " + e.getMessage(), e);
        }
    }

}