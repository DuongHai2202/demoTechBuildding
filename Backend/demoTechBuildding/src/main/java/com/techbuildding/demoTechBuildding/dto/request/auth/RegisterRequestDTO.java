package com.techbuildding.demoTechBuildding.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * DTO for user registration request.
 */
@Getter
@Setter
@Schema(description = "Request DTO for user registration")
public class RegisterRequestDTO implements Serializable {

    @NotBlank(message = "Username must not be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Unique username for login", example = "nguyenvana")
    private String username;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Schema(description = "User password", example = "Abc@123456")
    private String password;

    @Schema(description = "Full name", example = "Nguyen Van A")
    private String fullName;

    @Schema(description = "Phone number", example = "0901234567")
    private String phone;

    @Email(message = "Email is not valid")
    @Schema(description = "Email address", example = "nguyenvana@techbuilding.vn")
    private String email;
}
