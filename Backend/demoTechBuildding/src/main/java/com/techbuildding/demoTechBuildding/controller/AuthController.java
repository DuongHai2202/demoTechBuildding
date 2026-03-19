package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.auth.LoginRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.auth.RefreshTokenRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.auth.RegisterRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.auth.VerifyOtpRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.auth.TokenResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;
import com.techbuildding.demoTechBuildding.service.impl.AuthServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for register, verify OTP, login, and token refresh.
 * All endpoints are PUBLIC (no JWT required).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth controller", description = "APIs for authentication: register, verify OTP, login, refresh token")
public class AuthController {

    private final AuthServiceImpl authService;

    /**
     * POST /api/v1/auth/register - Register new user (status = PENDING)
     */
    @Operation(summary = "Register a new user", description = "Create a new user with PENDING status. An OTP code will be generated for verification.")
    @PostMapping("/register")
    public ResponseData<UserResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        log.info("Register request for: {}", request.getUsername());

        UserResponseDTO user = authService.register(request);
        return new ResponseData<>(HttpStatus.CREATED.value(), "User registered. Please verify OTP to activate account.",
                user);
    }

    /**
     * POST /api/v1/auth/verify-otp - Verify OTP and activate account
     */
    @Operation(summary = "Verify OTP", description = "Verify the OTP code to activate the account. Returns JWT tokens on success (auto-login).")
    @PostMapping("/verify-otp")
    public ResponseData<TokenResponseDTO> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO request) {
        log.info("Verify OTP request for: {}", request.getUsername());

        TokenResponseDTO tokens = authService.verifyOtpAndActivate(request.getUsername(), request.getOtpCode());
        return new ResponseData<>(HttpStatus.OK.value(), "Account activated successfully", tokens);
    }

    /**
     * POST /api/v1/auth/login - Login and receive JWT tokens
     */
    @Operation(summary = "Login", description = "Authenticate with username and password. Account must be ACTIVE (OTP verified).")
    @PostMapping("/login")
    public ResponseData<TokenResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        log.info("Login request for: {}", request.getUsername());

        TokenResponseDTO tokens = authService.login(request);
        return new ResponseData<>(HttpStatus.OK.value(), "Login successful", tokens);
    }

    /**
     * POST /api/v1/auth/refresh - Refresh expired access token
     */
    @Operation(summary = "Refresh access token", description = "Use a valid refresh token to get a new access token without re-login.")
    @PostMapping("/refresh")
    public ResponseData<TokenResponseDTO> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO request) {
        log.info("Refresh token request");

        TokenResponseDTO tokens = authService.refreshToken(request.getRefreshToken());
        return new ResponseData<>(HttpStatus.OK.value(), "Token refreshed successfully", tokens);
    }

    /**
     * POST /api/v1/auth/logout - Logout user
     */
    @Operation(summary = "Logout user", description = "Logout user by blacklisting the current access token.")
    @PostMapping("/logout")
    public ResponseData<Void> logout(@RequestHeader("Authorization") String authorizationHeader) {
        log.info("Logout request");

        authService.logout(authorizationHeader);
        return new ResponseData<>(HttpStatus.OK.value(), "Logged out successfully", null);
    }

    /**
     * GET /api/v1/auth/my-profile - Get current user profile
     */
    @Operation(summary = "Get current user profile", description = "Return the profile of the currently authenticated user based on JWT token.")
    @GetMapping("/my-profile")
    public ResponseData<UserResponseDTO> getCurrentUser() {
        log.info("Get current user profile request");
        UserResponseDTO user = authService.getCurrentUser();
        return new ResponseData<>(HttpStatus.OK.value(), "Success", user);
    }
}
