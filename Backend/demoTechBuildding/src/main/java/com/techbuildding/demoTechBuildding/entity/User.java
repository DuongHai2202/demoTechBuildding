package com.techbuildding.demoTechBuildding.entity;

import com.techbuildding.demoTechBuildding.util.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_users")
public class User extends AbstractEntity<Long> {

    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone", unique = true, length = 15)
    private String phone;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private UserStatus status;

    @Column(name = "face_descriptor", columnDefinition = "TEXT")
    private String faceDescriptor;

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean deleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private Partner partner;

    // === Quan hệ ===
    @Builder.Default
    @OneToMany(mappedBy = "user")
    private Set<UserHasRole> userHasRoles = new HashSet<>();

}
