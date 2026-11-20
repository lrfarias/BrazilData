package br.com.BrasilEmDados.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class PaginasConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/terminal-pib").setViewName("forward:/terminal-pib.html");
        registry.addViewController("/imposto-idh").setViewName("forward:/imposto-idh.html");
        registry.addViewController("/cambio").setViewName("forward:/cambio.html");
        registry.addViewController("/simulador-selic").setViewName("forward:/simulador-selic.html");
        registry.addViewController("/economia").setViewName("forward:/economia.html");
        registry.addViewController("/glossario").setViewName("forward:/glossario.html");
        registry.addViewController("/sobre").setViewName("forward:/sobre.html");
        registry.addViewController("/contato").setViewName("forward:/contato.html");
    }
}