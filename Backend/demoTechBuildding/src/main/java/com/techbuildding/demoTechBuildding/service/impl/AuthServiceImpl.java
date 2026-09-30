package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.auth.LoginRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.auth.RegisterRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.auth.TokenResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.auth.RegisterResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.exception.DuplicateResourceException;
import com.techbuildding.demoTechBuildding.exception.UnauthorizedException;
import com.techbuildding.demoTechBuildding.exception.ProtectedResourceException;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

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

    private static final String PROTECTED_ADMIN_USERNAME = "admin";

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final OtpService otpService;
    private final RoleRepository roleRepository;
    private final UserHasRoleRepository userHasRoleRepository;

    @Value("${app.demo.auto-fill-otp:false}")
    private boolean demoAutoFillOtp;

    @Value("${app.auth.otp-expiry-minutes:5}")
    private int otpExpiryMinutes;

    @Override
    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO request) {
        String username = normalizeRequired(request.getUsername(), "Tên đăng nhập");
        String fullName = normalizeRequired(request.getFullName(), "Họ và tên");
        String phone = normalizeOptional(request.getPhone());
        String email = normalizeEmail(request.getEmail());

        log.info("Registering new user: {}", username);

        // Validate uniqueness
        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.");
        }
        if (email != null && userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email đã được sử dụng. Vui lòng dùng email khác.");
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng. Vui lòng dùng số khác.");
        }

        // Keep the account pending until the one-time code is verified.
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(fullName)
                .phone(phone)
                .email(email)
                .status(UserStatus.PENDING)
                .build();

        User savedUser = userRepository.save(user);

        // Public registration can never self-assign an elevated role.
        roleRepository.findByName("GUEST").ifPresentOrElse(role -> {
            UserHasRole userHasRole = UserHasRole.builder()
                    .user(savedUser)
                    .role(role)
                    .build();
            userHasRoleRepository.save(userHasRole);
        }, () -> log.warn("Role GUEST is not seeded; user {} has no role", savedUser.getUsername()));

        // Generate OTP and save to database
        String otpCode = otpService.generateAndSaveOtp(savedUser, "REGISTER");

        log.info("User registered with PENDING status (userId: {})", savedUser.getId());

        return RegisterResponseDTO.builder()
                .user(userMapper.toResponseDTO(savedUser))
                .demoOtp(demoAutoFillOtp ? otpCode : null)
                .otpExpiresInSeconds(otpExpiryMinutes * 60L)
                .emailQueued(savedUser.getEmail() != null && !savedUser.getEmail().isBlank())
                .build();
    }

    private String normalizeRequired(String value, String fieldName) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new BadRequestException(fieldName + " không được để trống.");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeEmail(String value) {
        String normalized = normalizeOptional(value);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
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

        if (PROTECTED_ADMIN_USERNAME.equalsIgnoreCase(user.getUsername())) {
            throw new ProtectedResourceException("Tài khoản quản trị hệ thống admin được bảo vệ và không thể thay đổi trạng thái.");
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
        if (user.isDeleted() || user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
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
            throw new UnauthorizedException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
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
