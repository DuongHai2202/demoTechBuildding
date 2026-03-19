package com.techbuildding.demoTechBuildding.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * DTO for user login request.
 */
@Getter
@Setter
@Schema(description = "Request DTO for user login")
public class LoginRequestDTO implements Serializable {

    @NotBlank(message = "Username must not be blank")
    @Schema(description = "Username", example = "nguyenvana")
    private String username;

    @NotBlank(message = "Password must not be blank")
    @Schema(description = "Password", example = "Abc@123456")
    private String password;
}
