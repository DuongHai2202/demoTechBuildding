package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.auth.LoginRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.auth.RegisterRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.auth.TokenResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.mapper.UserMapper;
import com.techbuildding.demoTechBuildding.entity.UserHasRole;
import com.techbuildding.demoTechBuildding.repository.RoleRepository;
import com.techbuildding.demoTechBuildding.repository.UserHasRoleRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.security.JwtTokenProvider;
import com.techbuildding.demoTechBuildding.service.AuthService;
import com.techbuildding.demoTechBuildding.service.OtpService;
import com.techbuildding.demoTechBuildding.util.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService for JWT-based authentication.
 *
 * Register flow (with OTP):
 * 1. Validate uniqueness → Create user with status PENDING → Generate OTP
 * 2. User receives OTP → Calls /verify-otp → Status changes to ACTIVE
 * 3. User can now login → Receive JWT tokens
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final OtpService otpService;
    private final RoleRepository roleRepository;
    private final UserHasRoleRepository userHasRoleRepository;

    @Override
    @Transactional
    public UserResponseDTO register(RegisterRequestDTO request) {
        log.info("Registering new user: {}", request.getUsername());

        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Create user with ACTIVE status immediately (but still generate OTP for potential verification needs)
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        // First user registered becomes ADMIN, others become GUEST
        String roleName = (userRepository.count() <= 1) ? "ADMIN" : "GUEST";
        
        roleRepository.findByName(roleName).ifPresent(role -> {
            UserHasRole userHasRole = UserHasRole.builder()
                    .user(savedUser)
                    .role(role)
                    .build();
            userHasRoleRepository.save(userHasRole);
        });

        // Generate OTP and save to database
        String otpCode = otpService.generateAndSaveOtp(savedUser, "REGISTER");

        log.info("User registered with PENDING status. OTP: {} (userId: {})", otpCode, savedUser.getId());

        return userMapper.toResponseDTO(savedUser);
    }

    /**
     * Verify OTP and activate user account.
     */
    @Transactional
    public TokenResponseDTO verifyOtpAndActivate(String username, String otpCode) {
        log.info("Verifying OTP for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Allow OTP verification even if already active to support auto-activation flow
        // The OTP is still verified below for security, and tokens are returned.

        // Verify OTP
        boolean isValid = otpService.verifyOtp(user.getId(), otpCode, "REGISTER");
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP code");
        }

        // Activate user
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        log.info("User activated successfully: {}", username);

        // Auto-login: generate tokens so user doesn't need to login separately
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(username);

        return TokenResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public TokenResponseDTO login(LoginRequestDTO request) {
        log.info("Login attempt for user: {}", request.getUsername());

        // Check if account is activated
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUsername()));

        if (user.getStatus() == UserStatus.PENDING) {
            throw new RuntimeException("Account is not activated. Please verify your OTP first.");
        }

        // Authenticate using Spring Security's AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(request.getUsername());

        log.info("User logged in successfully: {}", request.getUsername());

        return TokenResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public TokenResponseDTO refreshToken(String refreshToken) {
        log.info("Refreshing access token");

        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        String username = jwtTokenProvider.getUsernameFromRefreshToken(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);

        log.info("Access token refreshed for user: {}", username);

        return TokenResponseDTO.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public void logout(String accessToken) {
        log.info("Logout request received");

        // Remove "Bearer " prefix if present
        if (accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        if (accessToken != null && jwtTokenProvider.validateAccessToken(accessToken)) {
            String username = jwtTokenProvider.getUsernameFromAccessToken(accessToken);
            jwtTokenProvider.blacklistToken(accessToken);
            jwtTokenProvider.removeRefreshToken(username);
            log.info("Token blacklisted and refresh token removed during logout for user: {}", username);
        } else {
            log.warn("Invalid or missing token during logout");
        }
    }
    @Override
    public UserResponseDTO getCurrentUser() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User not authenticated");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return userMapper.toResponseDTO(user);
    }
}
