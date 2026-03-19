package com.techbuildding.demoTechBuildding.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Swagger/OpenAPI configuration with JWT Bearer token support.
 * After login, click "Authorize" button and paste your access token
 * to test protected APIs directly in Swagger UI.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public GroupedOpenApi groupedOpenApi(@Value("${openapi.service.api-docs}") String apiDocs) {
        return GroupedOpenApi.builder()
                .group(apiDocs)
                .packagesToScan("com.techbuildding.demoTechBuildding.controller")
                .build();
    }

    @Bean
    public OpenAPI openApi(@Value("${openapi.service.title}") String title,
            @Value("${openapi.service.version}") String version,
            @Value("${openapi.service.description}") String description,
            @Value("${openapi.service.serverUrl}") String serverUrl) {
        return new OpenAPI()
                .servers(List.of(new Server().url(serverUrl)))
                .info(new Info()
                        .title(title)
                        .version(version)
                        .description(description)
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                // Add JWT Bearer authentication to Swagger UI
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT access token here")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
