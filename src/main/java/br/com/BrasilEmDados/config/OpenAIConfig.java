package br.com.BrasilEmDados.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;

@Configuration
public class OpenAIConfig {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Bean
    public OpenAIClient openAIClient() {
        // 1. Tenta pegar do application.properties, senão pega da variável de ambiente
        // do Windows
        String chave = (apiKey != null && !apiKey.isBlank())
                ? apiKey
                : System.getenv("OPENAI_API_KEY");

        if (chave == null || chave.isBlank()) {
            throw new IllegalStateException(
                    "Chave da OpenAI não encontrada! Configure openai.api.key no application.properties.");
        }

        // 2. O .trim() e o .replaceAll removem quebras de linha (0x0a / 0x0d) e espaços
        // invisíveis
        String chaveLimpa = chave.replaceAll("[\\r\\n\\s]+", "").trim();

        return OpenAIOkHttpClient.builder()
                .apiKey(chaveLimpa)
                .build();
    }
}