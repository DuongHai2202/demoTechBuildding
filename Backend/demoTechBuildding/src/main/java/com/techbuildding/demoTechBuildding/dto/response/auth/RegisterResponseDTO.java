package com.techbuildding.demoTechBuildding.dto.response.auth;

import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * Result of registration. demoOtp is populated only when the demo flag is
 * enabled; production responses never expose the OTP.
 */
@Getter
@Setter
@Builder
@Schema(description = "Registration result and OTP delivery metadata")
public class RegisterResponseDTO implements Serializable {

    private UserResponseDTO user;

    @Schema(description = "OTP exposed only for local demo mode")
    private String demoOtp;

    private long otpExpiresInSeconds;
    private boolean emailQueued;
}
