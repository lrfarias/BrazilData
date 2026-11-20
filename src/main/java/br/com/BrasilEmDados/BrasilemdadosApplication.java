package br.com.BrasilEmDados;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BrasilemdadosApplication {

	public static void main(String[] args) {
		SpringApplication.run(BrasilemdadosApplication.class, args);
	}

}
