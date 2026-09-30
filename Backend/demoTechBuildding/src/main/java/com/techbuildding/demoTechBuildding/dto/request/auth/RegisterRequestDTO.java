package com.techbuildding.demoTechBuildding.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "không được để trống")
    @Size(min = 3, max = 50, message = "phải có từ 3 đến 50 ký tự")
    @Schema(description = "Unique username for login", example = "nguyenvana")
    private String username;

    @NotBlank(message = "không được để trống")
    @Size(min = 6, message = "phải có ít nhất 6 ký tự")
    @Schema(description = "User password", example = "Abc@123456")
    private String password;

    @NotBlank(message = "không được để trống")
    @Size(min = 2, max = 100, message = "phải có từ 2 đến 100 ký tự")
    @Schema(description = "Full name", example = "Nguyen Van A")
    private String fullName;

    @Size(max = 15, message = "không được vượt quá 15 ký tự")
    @Pattern(regexp = "^(?:\\+84|0)(?:3|5|7|8|9)\\d{8}$", message = "không đúng định dạng số điện thoại Việt Nam")
    @Schema(description = "Phone number", example = "0901234567")
    private String phone;

    @Email(message = "không đúng định dạng email")
    @Schema(description = "Email address", example = "nguyenvana@techbuilding.vn")
    private String email;
}
