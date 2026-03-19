package com.techbuildding.demoTechBuildding.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enable @Async annotation support for asynchronous method execution.
 * Used by EmailService to send emails without blocking API response.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
