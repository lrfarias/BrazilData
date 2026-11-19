package br.com.BrasilEmDados.config;

import br.com.BrasilEmDados.model.Estado;
import br.com.BrasilEmDados.model.IndicadorEconomico;
import br.com.BrasilEmDados.repository.EstadoRepository;
import br.com.BrasilEmDados.repository.IndicadorEconomicoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Component
@Order(2)
@EnableScheduling
public class IbgeImportador implements CommandLineRunner {

    private static final String BASE = "https://servicodados.ibge.gov.br/api/v3/agregados/";

    private static final Map<String, String> UF = Map.ofEntries(
            Map.entry("11", "RO"), Map.entry("12", "AC"), Map.entry("13", "AM"), Map.entry("14", "RR"),
            Map.entry("15", "PA"), Map.entry("16", "AP"), Map.entry("17", "TO"), Map.entry("21", "MA"),
            Map.entry("22", "PI"), Map.entry("23", "CE"), Map.entry("24", "RN"), Map.entry("25", "PB"),
            Map.entry("26", "PE"), Map.entry("27", "AL"), Map.entry("28", "SE"), Map.entry("29", "BA"),
            Map.entry("31", "MG"), Map.entry("32", "ES"), Map.entry("33", "RJ"), Map.entry("35", "SP"),
            Map.entry("41", "PR"), Map.entry("42", "SC"), Map.entry("43", "RS"), Map.entry("50", "MS"),
            Map.entry("51", "MT"), Map.entry("52", "GO"), Map.entry("53", "DF"));

    // { nome salvo no banco, tabela do IBGE, variável do IBGE }
    private static final List<String[]> INDICADORES = List.of(
            new String[] { "PIB", "5938", "37" },
            new String[] { "População", "6579", "9324" });

    private final EstadoRepository estadoRepo;
    private final IndicadorEconomicoRepository indicadorRepo;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient http = HttpClient.newHttpClient();

    public IbgeImportador(EstadoRepository estadoRepo, IndicadorEconomicoRepository indicadorRepo) {
        this.estadoRepo = estadoRepo;
        this.indicadorRepo = indicadorRepo;
    }

    @Override
    public void run(String... args) {
        atualizar();
    }

    // roda todo dia 1 de cada mês, às 3h
    @Scheduled(cron = "0 0 3 1 * *")
    public void atualizarMensal() {
        atualizar();
    }

    private synchronized void atualizar() {
        Map<String, Estado> porSigla = new HashMap<>();
        for (Estado e : estadoRepo.findAll())
            porSigla.put(e.getSigla(), e);

        Map<String, IndicadorEconomico> existentes = new HashMap<>();
        for (IndicadorEconomico i : indicadorRepo.findAll()) {
            existentes.put(chave(i.getNome(), i.getEstado().getSigla(), i.getAnoReferencia()), i);
        }

        int novos = 0, atualizados = 0;
        for (String[] ind : INDICADORES) {
            try {
                int[] r = importar(ind[0], ind[1], ind[2], porSigla, existentes);
                novos += r[0];
                atualizados += r[1];
            } catch (Exception ex) {
                System.err.println("[IBGE] Falha em " + ind[0] + ": " + ex.getMessage());
            }
        }
        System.out.println("[IBGE] Concluído: " + novos + " novos, " + atualizados + " atualizados.");
    }

    private int[] importar(String nome, String agregado, String variavel,
            Map<String, Estado> porSigla,
            Map<String, IndicadorEconomico> existentes) throws Exception {
        String url = BASE + agregado + "/periodos/-10/variaveis/" + variavel
                + "?localidades=N3%5Ball%5D";
        HttpRequest req = HttpRequest.newBuilder(URI.create(url)).GET().build();
        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200)
            throw new RuntimeException("HTTP " + resp.statusCode());

        int novos = 0, atualizados = 0;
        for (JsonNode v : mapper.readTree(resp.body())) {
            String unidade = v.path("unidade").asText(null);
            for (JsonNode r : v.path("resultados")) {
                for (JsonNode s : r.path("series")) {
                    String sigla = UF.get(s.path("localidade").path("id").asText());
                    Estado estado = sigla == null ? null : porSigla.get(sigla);
                    if (estado == null)
                        continue;

                    Iterator<Map.Entry<String, JsonNode>> it = s.path("serie").fields();
                    while (it.hasNext()) {
                        Map.Entry<String, JsonNode> e = it.next();
                        BigDecimal valor;
                        try {
                            valor = new BigDecimal(e.getValue().asText());
                        } catch (NumberFormatException ignorado) {
                            continue;
                        }

                        Integer ano = Integer.valueOf(e.getKey());
                        String k = chave(nome, sigla, ano);
                        IndicadorEconomico atual = existentes.get(k);

                        if (atual == null) {
                            IndicadorEconomico novo = new IndicadorEconomico(
                                    nome, valor, ano, unidade, "IBGE", estado);
                            existentes.put(k, indicadorRepo.save(novo));
                            novos++;
                        } else if (atual.getValor().compareTo(valor) != 0) {
                            atual.setValor(valor);
                            indicadorRepo.save(atual);
                            atualizados++;
                        }
                    }
                }
            }
        }
        return new int[] { novos, atualizados };
    }

    private String chave(String nome, String sigla, Integer ano) {
        return nome + "|" + sigla + "|" + ano;
    }
}