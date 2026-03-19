package com.techbuildding.demoTechBuildding.dto.response.auth;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * DTO for returning JWT tokens after login or token refresh.
 */
@Getter
@Setter
@Builder
public class TokenResponseDTO implements Serializable {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";
}
