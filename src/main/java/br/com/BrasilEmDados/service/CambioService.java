package br.com.BrasilEmDados.service; // <-- ajuste para o package da sua pasta service

import br.com.BrasilEmDados.dto.CotacaoCambioResponse; // <-- ajuste para o package da sua pasta dto
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class CambioService {

    private static final String URL_CAMBIO_USD = "https://open.er-api.com/v6/latest/USD";
    private static final Duration TTL_CACHE = Duration.ofMinutes(5);

    private final RestClient restClient;
    private final ReentrantLock lock = new ReentrantLock();

    private volatile CotacaoCambioResponse cacheAtual;

    public CambioService(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    public CotacaoCambioResponse obterCotacoesUsd() {
        CotacaoCambioResponse atual = this.cacheAtual;
        Instant agora = Instant.now();

        if (atual != null && Duration.between(atual.atualizadoEm(), agora).compareTo(TTL_CACHE) < 0) {
            return atual;
        }

        lock.lock();
        try {
            atual = this.cacheAtual;
            agora = Instant.now();
            if (atual != null && Duration.between(atual.atualizadoEm(), agora).compareTo(TTL_CACHE) < 0) {
                return atual;
            }

            ExternalRateApiResponse externa = restClient.get()
                    .uri(URL_CAMBIO_USD)
                    .retrieve()
                    .body(ExternalRateApiResponse.class);

            if (externa != null && externa.rates() != null && !externa.rates().isEmpty()) {
                CotacaoCambioResponse nova = new CotacaoCambioResponse(
                        externa.base_code() != null ? externa.base_code() : "USD",
                        agora,
                        "open.er-api.com (cache 5min)",
                        Collections.unmodifiableMap(externa.rates()));
                this.cacheAtual = nova;
                return nova;
            }

            if (atual != null) {
                return atual;
            }

            throw new IllegalStateException("Não foi possível obter as cotações de câmbio no momento.");
        } catch (Exception ex) {
            if (this.cacheAtual != null) {
                return this.cacheAtual;
            }
            throw ex;
        } finally {
            lock.unlock();
        }
    }

    private record ExternalRateApiResponse(
            String base_code,
            Map<String, Double> rates) {
    }
}