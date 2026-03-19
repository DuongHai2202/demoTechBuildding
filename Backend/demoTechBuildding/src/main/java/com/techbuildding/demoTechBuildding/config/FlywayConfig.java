package com.techbuildding.demoTechBuildding.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // Repair the schema history table before migrating
            flyway.repair();
            // Then run migrations as usual
            flyway.migrate();
        };
    }
}
