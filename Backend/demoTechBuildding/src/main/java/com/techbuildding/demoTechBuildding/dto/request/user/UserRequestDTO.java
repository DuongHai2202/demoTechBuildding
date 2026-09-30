package com.techbuildding.demoTechBuildding.dto.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @Schema(description = "Unique username for login", example = "nguyenvana")
    @Size(min = 3, max = 50, message = "Username phải dài từ 3 đến 50 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username chỉ gồm chữ cái, số, dấu chấm, gạch ngang hoặc gạch dưới")
    private String username;

    @Schema(description = "User password", example = "Abc@123456")
    @Size(min = 6, max = 100, message = "Mật khẩu phải dài từ 6 đến 100 ký tự")
    private String password;

    @Schema(description = "Full name of the user", example = "Nguyen Van A")
    @Size(max = 150, message = "Họ tên không được vượt quá 150 ký tự")
    private String fullName;

    @Schema(description = "Phone number", example = "0901234567")
    @Pattern(regexp = "^(\\+84|0)(3|5|7|8|9)\\d{8}$", message = "Số điện thoại không đúng định dạng")
    private String phone;

    @Email(message = "Email is not valid")
    @Schema(description = "Unique email address", example = "nguyenvana@techbuilding.vn")
    private String email;

    @Schema(description = "Exactly one role assigned to the user", example = "[\"STAFF\"]")
    private java.util.List<String> roles;

    @Schema(description = "User account status", example = "ACTIVE")
    private String status;

    @Schema(description = "ID of the partner organization", example = "1")
    private Integer partnerId;
}
