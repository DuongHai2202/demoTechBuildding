package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.auth.LoginRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.auth.RegisterRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.auth.TokenResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    UserResponseDTO register(RegisterRequestDTO request);

    TokenResponseDTO login(LoginRequestDTO request);

    TokenResponseDTO refreshToken(String refreshToken);

    void logout(String accessToken);

    UserResponseDTO getCurrentUser();
}
