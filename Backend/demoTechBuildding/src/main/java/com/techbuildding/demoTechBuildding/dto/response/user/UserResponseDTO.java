package com.techbuildding.demoTechBuildding.dto.response.user;

import com.techbuildding.demoTechBuildding.util.enums.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for returning user information to the client.
 * Excludes sensitive fields such as password and is_deleted.
 */
@Getter
@Setter
@Schema(description = "Response DTO containing user information")
public class UserResponseDTO implements Serializable {

    private Long id;
    private String username;
    private String fullName;
    private String phone;
    private String email;
    private String avatarUrl;
    private UserStatus status;
    private LocalDateTime createdAt;
    private List<String> roles;
    private Integer partnerId;
    private String partnerName;
    private boolean hasFaceRegistered;
    private String faceDescriptor;
}
