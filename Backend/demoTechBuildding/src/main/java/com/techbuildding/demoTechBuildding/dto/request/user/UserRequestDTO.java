package com.techbuildding.demoTechBuildding.dto.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * DTO for creating or updating a user.
 * Validates input fields before persisting to database.
 */
@Getter
@Setter
@Schema(description = "Request DTO for creating or updating a user")
public class UserRequestDTO implements Serializable {

    @NotBlank(message = "Username must not be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Unique username for login", example = "nguyenvana", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Schema(description = "User password", example = "Abc@123456", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @Schema(description = "Full name of the user", example = "Nguyen Van A")
    private String fullName;

    @Schema(description = "Phone number", example = "0901234567")
    private String phone;

    @Email(message = "Email is not valid")
    @Schema(description = "Unique email address", example = "nguyenvana@techbuilding.vn")
    private String email;

    @Schema(description = "Roles assigned to the user", example = "[\"ADMIN\", \"STAFF\"]")
    private java.util.List<String> roles;

    @Schema(description = "User account status", example = "ACTIVE")
    private String status;

    @Schema(description = "ID of the partner organization", example = "1")
    private Integer partnerId;
}
