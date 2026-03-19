package com.techbuildding.demoTechBuildding.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
    // Kích hoạt @CreatedDate, @LastModifiedDate, @CreatedBy, @LastModifiedBy
    // trong AbstractEntity để tự động ghi audit fields khi save Entity
}
