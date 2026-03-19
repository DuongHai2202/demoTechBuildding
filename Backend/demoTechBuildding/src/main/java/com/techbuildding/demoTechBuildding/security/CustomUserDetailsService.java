package com.techbuildding.demoTechBuildding.security;

import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.entity.UserHasRole;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Custom implementation of Spring Security's UserDetailsService.
 * Loads user from database and converts to Spring Security's UserDetails.
 *
 * This class bridges our User entity with Spring Security's authentication
 * system.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by username from database.
     * Maps user roles to Spring Security GrantedAuthority with "ROLE_" prefix.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user by username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Convert user's roles to Spring Security authorities
        // e.g., Role "ADMIN" → GrantedAuthority "ROLE_ADMIN"
        List<SimpleGrantedAuthority> authorities = user.getUserHasRoles().stream()
                .map(UserHasRole::getRole)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                !user.isDeleted(), // enabled = not deleted
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities);
    }
}
