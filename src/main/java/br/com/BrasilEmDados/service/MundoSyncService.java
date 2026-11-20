package br.com.BrasilEmDados.service;

import br.com.BrasilEmDados.model.Pais;
import br.com.BrasilEmDados.repository.PaisRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class MundoSyncService {

    private final PaisRepository paisRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public MundoSyncService(PaisRepository paisRepository) {
        this.paisRepository = paisRepository;
    }

    // Roda automaticamente todo dia às 04:00 da manhã
    @Scheduled(cron = "0 0 4 * * *")
    public void sincronizarAgendado() {
        sincronizarTudo();
    }

    public int sincronizarTudo() {
        Map<String, double[]> pib = buscarIndicadorWB("NY.GDP.MKTP.CD");
        Map<String, double[]> pibPpc = buscarIndicadorWB("NY.GDP.MKTP.PP.CD");
        Map<String, double[]> pibPc = buscarIndicadorWB("NY.GDP.PCAP.CD");
        Map<String, double[]> pop = buscarIndicadorWB("SP.POP.TOTL");
        Map<String, double[]> cresc = buscarIndicadorWB("NY.GDP.MKTP.KD.ZG");
        Map<String, double[]> infla = buscarIndicadorWB("FP.CPI.TOTL.ZG");
        Map<String, double[]> imposto = buscarIndicadorWB("GC.TAX.TOTL.GD.ZS");
        Map<String, double[]> gini = buscarIndicadorWB("SI.POV.GINI");
        Map<String, Double> cambioUsd = buscarCambioUSD();

        int salvos = 0;
        try {
            String json = restTemplate.getForObject(
                    "https://api.worldbank.org/v2/country?format=json&per_page=350", String.class);
            JsonNode root = mapper.readTree(json);
            JsonNode lista = root.get(1);

            if (lista != null && lista.isArray()) {
                for (JsonNode c : lista) {
                    String regiao = c.path("region").path("value").asText("");
                    if ("Aggregates".equalsIgnoreCase(regiao))
                        continue;

                    String iso3 = c.path("id").asText("");
                    if (iso3.length() != 3)
                        continue;

                    Pais p = paisRepository.findById(iso3).orElse(new Pais());
                    p.setIso3(iso3);
                    p.setNome(c.path("name").asText(iso3));
                    p.setCapital(c.path("capitalCity").asText("—"));
                    p.setContinente(regiao);
                    p.setRegiaoGeo(regiao);

                    String iso2 = c.path("iso2Code").asText("").toLowerCase();
                    if (iso2.length() == 2) {
                        p.setFlag("https://flagcdn.com/w80/" + iso2 + ".png");
                    }

                    preencherValor(pib.get(iso3), (v, a) -> {
                        p.setPib(v);
                        p.setPibAno(a);
                    });
                    preencherValor(pibPpc.get(iso3), (v, a) -> {
                        p.setPibPpc(v);
                        p.setPibPpcAno(a);
                    });
                    preencherValor(pibPc.get(iso3), (v, a) -> {
                        p.setPibPc(v);
                        p.setPibPcAno(a);
                    });
                    preencherValor(pop.get(iso3), (v, a) -> {
                        p.setPop(v);
                        p.setPopAno(a);
                    });
                    preencherValor(cresc.get(iso3), (v, a) -> {
                        p.setCresc(v);
                        p.setCrescAno(a);
                    });
                    preencherValor(infla.get(iso3), (v, a) -> {
                        p.setInfla(v);
                        p.setInflaAno(a);
                    });
                    preencherValor(imposto.get(iso3), (v, a) -> {
                        p.setImposto(v);
                        p.setImpostoAno(a);
                    });
                    preencherValor(gini.get(iso3), (v, a) -> {
                        p.setGini(v);
                        p.setGiniAno(a);
                    });

                    if ("BRA".equals(iso3)) {
                        p.setMoeda("BRL");
                        p.setMoedaBrl(1.0);
                    } else if (p.getMoeda() != null && cambioUsd.containsKey(p.getMoeda())
                            && cambioUsd.containsKey("BRL")) {
                        p.setMoedaBrl(cambioUsd.get("BRL") / cambioUsd.get(p.getMoeda()));
                    }

                    p.setAtualizadoEm(LocalDateTime.now());
                    paisRepository.save(p);
                    salvos++;
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao sincronizar países: " + e.getMessage());
        }
        return salvos;
    }

    private Map<String, double[]> buscarIndicadorWB(String indicador) {
        Map<String, double[]> mapa = new HashMap<>();
        try {
            String url = "https://api.worldbank.org/v2/country/all/indicator/" + indicador
                    + "?format=json&mrnev=1&per_page=350";
            String json = restTemplate.getForObject(url, String.class);
            JsonNode arr = mapper.readTree(json).get(1);
            if (arr != null && arr.isArray()) {
                for (JsonNode row : arr) {
                    String iso = row.path("countryiso3code").asText("");
                    if (!iso.isEmpty() && !row.path("value").isNull()) {
                        double val = row.path("value").asDouble();
                        double ano = row.path("date").asDouble(2024);
                        mapa.put(iso, new double[] { val, ano });
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return mapa;
    }

    private Map<String, Double> buscarCambioUSD() {
        Map<String, Double> taxas = new HashMap<>();
        try {
            String json = restTemplate.getForObject("https://open.er-api.com/v6/latest/USD", String.class);
            JsonNode rates = mapper.readTree(json).path("rates");
            rates.fields().forEachRemaining(e -> taxas.put(e.getKey(), e.getValue().asDouble()));
        } catch (Exception ignored) {
        }
        return taxas;
    }

    @FunctionalInterface
    private interface ValorAnoConsumer {
        void accept(Double valor, String ano);
    }

    private void preencherValor(double[] par, ValorAnoConsumer consumer) {
        if (par != null) {
            consumer.accept(par[0], String.valueOf((int) par[1]));
        }
    }
}