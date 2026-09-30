package com.techbuildding.demoTechBuildding.config;

import com.techbuildding.demoTechBuildding.security.CustomAccessDeniedHandler;
import com.techbuildding.demoTechBuildding.security.JwtAuthenticationEntryPoint;
import com.techbuildding.demoTechBuildding.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

/**
 * Security configuration for JWT-based stateless authentication.
 *
 * Key decisions:
 * - CSRF disabled: API is stateless (no cookies/sessions), CSRF not applicable
 * - Session STATELESS: each request must carry JWT token, no server-side
 * session
 * - JWT filter runs BEFORE UsernamePasswordAuthenticationFilter
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize on controller methods
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    /**
     * Endpoints that do NOT require authentication.
     */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/verify-otp",
            "/api/v1/auth/refresh",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF (not needed for stateless JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // Allow browser preflight requests and apply the configured
                // allow-list before JWT authorization is evaluated.
                .cors(Customizer.withDefaults())

                // Stateless session: no session stored on server
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        // Account and role administration are system-admin only.
                        // A signed-in user may only read or update their own
                        // biometric template through the /me endpoint. This
                        // must be declared before the admin-only /users/**
                        // matcher below, otherwise STAFF/PM accounts receive
                        // 403 while the attendance screen loads their face data.
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/me/face-descriptor").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/users/me/face-descriptor").authenticated()
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/role-requests").authenticated()
                        .requestMatchers("/api/v1/role-requests/**").hasRole("ADMIN")

                        // Notifications and authenticated file downloads are available
                        // to signed-in users; writes to storage still require an
                        // operational role.
                        .requestMatchers("/api/v1/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/files/download").hasAnyRole("ADMIN", "PM", "STAFF", "PARTNER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/files/**").hasAnyRole("ADMIN", "PM", "STAFF", "PARTNER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/files/**").hasAnyRole("ADMIN", "PM")

                        // Projects: only ADMIN/PM can change the project master
                        // data. Read access is limited to active workspace roles.
                        .requestMatchers(HttpMethod.GET, "/api/v1/projects/**").hasAnyRole("ADMIN", "PM", "STAFF", "PARTNER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/*/members/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/projects/*/members/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/projects/*/members/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/*/zones/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/projects/*/zones/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/*/slides/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/projects/*/slides/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/*/master-plan/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/projects/*/master-plan/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/projects/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/projects/**").hasAnyRole("ADMIN", "PM")

                        // Contracts and their workflow/documents contain internal
                        // commercial data. They are readable and editable by the
                        // project-management role; other roles cannot call these
                        // endpoints directly.
                        .requestMatchers("/api/v1/contracts/**").hasAnyRole("ADMIN", "PM")

                        // Tender management is PM-owned. A partner may submit a
                        // bid, but cannot see other bidders or alter evaluation.
                        .requestMatchers(HttpMethod.POST, "/api/v1/bid-submissions").hasAnyRole("ADMIN", "PM", "PARTNER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bid-submissions/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bid-submissions/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bidding-packages", "/api/v1/bidding-packages/**").hasAnyRole("ADMIN", "PM", "PARTNER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/bidding-packages").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bidding-packages/**").hasAnyRole("ADMIN", "PM")

                        // Material catalogue is readable by operational users;
                        // catalogue changes and approvals are PM-owned.
                        .requestMatchers(HttpMethod.GET, "/api/v1/materials/**").hasAnyRole("ADMIN", "PM", "STAFF", "PARTNER")
                        .requestMatchers("/api/v1/materials/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.GET, "/api/v1/material-categories/**").hasAnyRole("ADMIN", "PM", "STAFF", "PARTNER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/material-norms/**").hasAnyRole("ADMIN", "PM", "STAFF")
                        .requestMatchers("/api/v1/material-norms/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.POST, "/api/v1/material-requests").hasAnyRole("ADMIN", "PM", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/v1/material-requests/**").hasAnyRole("ADMIN", "PM", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/material-requests/**").hasAnyRole("ADMIN", "PM", "STAFF")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/material-requests/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/material-requests/**").hasAnyRole("ADMIN", "PM")

                        // Field logs: staff can submit; management reviews and
                        // removes records.
                        .requestMatchers(HttpMethod.POST, "/api/v1/work-logs").hasAnyRole("ADMIN", "PM", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/v1/work-logs/project/**").hasAnyRole("ADMIN", "PM", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/v1/work-logs").hasAnyRole("ADMIN", "PM", "STAFF")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/work-logs/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/work-logs/**").hasAnyRole("ADMIN", "PM")

                        // Partners and technical standards are reference data for
                        // the workspace; mutations remain management-only.
                        .requestMatchers(HttpMethod.GET, "/api/v1/partners/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers("/api/v1/partners/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.GET, "/api/v1/technical-standards/**").hasAnyRole("ADMIN", "PM", "STAFF", "PARTNER")
                        .requestMatchers("/api/v1/technical-standards/**").hasAnyRole("ADMIN", "PM")

                        // Attendance keeps its finer-grained method annotations;
                        // this matcher prevents GUEST/PARTNER from bypassing it.
                        .requestMatchers("/api/v1/attendance/**").hasAnyRole("ADMIN", "PM", "STAFF")

                        // Shift planning is visible to operational attendance
                        // users; creating/cancelling assignments is protected by
                        // the controller's manager-only method annotations.
                        .requestMatchers("/api/v1/shifts/**").hasAnyRole("ADMIN", "PM", "STAFF")

                        // Supporting project modules follow the same read/write
                        // split as the project workspace.
                        .requestMatchers(HttpMethod.GET, "/api/v1/drawings/**", "/api/v1/design-sheets/**", "/api/v1/bim-models/**", "/api/v1/rfis/**", "/api/v1/submissions/**").hasAnyRole("ADMIN", "PM", "STAFF", "PARTNER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/drawings/**", "/api/v1/design-sheets/**", "/api/v1/bim-models/**", "/api/v1/rfis/**", "/api/v1/submissions/**").hasAnyRole("ADMIN", "PM", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/drawings/**", "/api/v1/design-sheets/**", "/api/v1/bim-models/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/drawings/**", "/api/v1/design-sheets/**", "/api/v1/bim-models/**", "/api/v1/rfis/**", "/api/v1/submissions/**").hasAnyRole("ADMIN", "PM")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/drawings/**", "/api/v1/design-sheets/**", "/api/v1/bim-models/**").hasAnyRole("ADMIN", "PM")

                        .anyRequest().authenticated())

                // Custom error responses for 401 and 403
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))

                // Add JWT filter before Spring's default auth filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Password encoder using BCrypt hashing algorithm.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication manager for authenticating login requests.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
