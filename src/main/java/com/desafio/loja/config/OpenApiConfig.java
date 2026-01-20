package com.desafio.loja.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuração do OpenAPI/Swagger.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Loja API - Desafio Técnico")
                        .version("1.0.0")
                        .description("API REST para gerenciamento de produtos e pedidos. " +
                                "Inclui validações de estoque, preço e checkout transacional.")
                        .contact(new Contact()
                                .name("Equipe de Desenvolvimento")
                                .email("dev@loja.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Servidor Local")
                ));
    }

}
