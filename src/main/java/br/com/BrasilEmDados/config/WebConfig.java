package br.com.BrasilEmDados.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/economia").setViewName("forward:/economia.html");
        registry.addViewController("/glossario").setViewName("forward:/glossario.html");
        registry.addViewController("/sobre").setViewName("forward:/sobre.html");
        registry.addViewController("/contato").setViewName("forward:/contato.html");

        // 08 Módulos ativos
        registry.addViewController("/terminal-pib").setViewName("forward:/terminal-pib.html");
        registry.addViewController("/imposto-idh").setViewName("forward:/imposto-idh.html");
        registry.addViewController("/cambio").setViewName("forward:/cambio.html");
        registry.addViewController("/simulador-selic").setViewName("forward:/simulador-selic.html");
        registry.addViewController("/mundo").setViewName("forward:/mundo.html");
        registry.addViewController("/inflacao").setViewName("forward:/inflacao.html");
        registry.addViewController("/contas-publicas").setViewName("forward:/contas-publicas.html");
        registry.addViewController("/agro").setViewName("forward:/agro.html");
    }
}