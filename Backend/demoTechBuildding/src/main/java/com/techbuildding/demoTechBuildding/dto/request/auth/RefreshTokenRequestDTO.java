package com.techbuildding.demoTechBuildding.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * DTO for refreshing an expired access token.
 */
@Getter
@Setter
@Schema(description = "Request DTO for refreshing access token")
public class RefreshTokenRequestDTO implements Serializable {

    @NotBlank(message = "Refresh token must not be blank")
    @Schema(description = "The refresh token received during login")
    private String refreshToken;
}
