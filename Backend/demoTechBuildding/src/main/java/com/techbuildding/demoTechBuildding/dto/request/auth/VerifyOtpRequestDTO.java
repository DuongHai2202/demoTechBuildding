package com.techbuildding.demoTechBuildding.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * DTO for verifying OTP code after registration.
 */
@Getter
@Setter
@Schema(description = "Request DTO for OTP verification")
public class VerifyOtpRequestDTO implements Serializable {

    @NotBlank(message = "Username must not be blank")
    @Schema(description = "Username of the account to verify", example = "nguyenvana")
    private String username;

    @NotBlank(message = "OTP code must not be blank")
    @Size(min = 6, max = 6, message = "OTP code must be exactly 6 digits")
    @Schema(description = "6-digit OTP code", example = "123456")
    private String otpCode;
}
