package br.com.BrasilEmDados.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.openai.client.OpenAIClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;

import br.com.BrasilEmDados.model.IndicadorEconomico;
import br.com.BrasilEmDados.repository.IndicadorEconomicoRepository;

@Service
public class AssistenteEconomicoService {

        private final OpenAIClient client;
        private final IndicadorEconomicoRepository indicadorRepository;

        public AssistenteEconomicoService(OpenAIClient client,
                        IndicadorEconomicoRepository indicadorRepository) {
                this.client = client;
                this.indicadorRepository = indicadorRepository;
        }

        public String perguntar(String pergunta, String siglaUf) {
                try {
                        List<IndicadorEconomico> indicadores = (siglaUf != null && !siglaUf.isBlank())
                                        ? indicadorRepository.findByEstado_Sigla(siglaUf.toUpperCase())
                                        : indicadorRepository.findAll();

                        String contextoBanco = indicadores.stream()
                                        .map(ind -> String.format("- %s (%s) [%d]: %s = %s %s (Fonte: %s)",
                                                        ind.getEstado().getNome(),
                                                        ind.getEstado().getSigla(),
                                                        ind.getAnoReferencia(),
                                                        ind.getNome(),
                                                        ind.getValor().toPlainString(),
                                                        ind.getUnidade(),
                                                        ind.getFonte()))
                                        .collect(Collectors.joining("\n"));

                        if (contextoBanco.isBlank()) {
                                contextoBanco = "Nenhum indicador cadastrado no banco para o filtro informado.";
                        }

                        String promptCompleto = """
                                        Você é o assistente econômico oficial da plataforma BrasilEmDados.
                                        Responda de maneira clara, didática e objetiva.
                                        Utilize prioritariamente os dados oficiais abaixo, extraídos do nosso banco de dados:

                                        DADOS OFICIAIS DO BANCO:
                                        %s

                                        PERGUNTA DO USUÁRIO:
                                        %s
                                        """
                                        .formatted(contextoBanco, pergunta);

                        ResponseCreateParams parametros = ResponseCreateParams.builder()
                                        .model(ChatModel.GPT_4O_MINI)
                                        .input(promptCompleto)
                                        .build();

                        Response resposta = client.responses().create(parametros);

                        return resposta.output().stream()
                                        .flatMap(item -> item.message().stream())
                                        .flatMap(mensagem -> mensagem.content().stream())
                                        .flatMap(conteudo -> conteudo.outputText().stream())
                                        .map(texto -> texto.text())
                                        .reduce("", String::concat);

                } catch (Exception e) {
                        e.printStackTrace();
                        return "Erro ao consultar o Assistente OpenAI: " + e.getMessage();
                }
        }
}