package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.user.RoleRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.RoleRequestResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Role;
import com.techbuildding.demoTechBuildding.entity.RoleRequest;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.entity.UserHasRole;
import com.techbuildding.demoTechBuildding.repository.*;
import com.techbuildding.demoTechBuildding.service.RoleRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleRequestServiceImpl implements RoleRequestService {

    private final RoleRequestRepository roleRequestRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserHasRoleRepository userHasRoleRepository;
    private final com.techbuildding.demoTechBuildding.service.NotificationService notificationService;

    @Override
    @Transactional
    public RoleRequestResponseDTO createRequest(Long userId, RoleRequestDTO request) {
        log.info("Creating role request for user id: {} to role: {}", userId, request.getRoleName());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleName()));

        RoleRequest roleRequest = RoleRequest.builder()
                .user(user)
                .requestedRole(role)
                .reason(request.getReason())
                .status("PENDING")
                .build();

        RoleRequest saved = roleRequestRepository.save(roleRequest);

        // Notify Admins
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getUserHasRoles().stream().anyMatch(uhr -> uhr.getRole().getName().equals("ADMIN")))
                .collect(Collectors.toList());
        
        for (User admin : admins) {
            notificationService.sendNotification(
                admin.getId(),
                "Yêu cầu cấp quyền mới",
                "User " + user.getUsername() + " yêu cầu quyền: " + role.getName(),
                "INFO",
                "/approval-requests"
            );
        }

        return mapToResponse(saved);
    }

    @Override
    public List<RoleRequestResponseDTO> getAllRequests() {
        return roleRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoleRequestResponseDTO updateRequestStatus(Long requestId, String status, String adminNote) {
        log.info("Updating role request id: {} to status: {}", requestId, status);
        
        RoleRequest roleRequest = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        roleRequest.setStatus(status);
        roleRequest.setAdminNote(adminNote);

        if ("APPROVED".equalsIgnoreCase(status)) {
            // Assign the new role to the user
            User user = roleRequest.getUser();
            Role role = roleRequest.getRequestedRole();

            // Check if user already has this role to avoid duplicate
            boolean alreadyHasRole = user.getUserHasRoles().stream()
                    .anyMatch(uhr -> uhr.getRole().getName().equals(role.getName()));

            if (!alreadyHasRole) {
                UserHasRole userHasRole = UserHasRole.builder()
                        .user(user)
                        .role(role)
                        .build();
                userHasRoleRepository.save(userHasRole);
                log.info("Role {} assigned to user {}", role.getName(), user.getUsername());
            }

            // Notify User
            notificationService.sendNotification(
                user.getId(),
                "Yêu cầu cấp quyền đã được duyệt",
                "Bạn đã được cấp quyền: " + role.getName(),
                "SUCCESS",
                "/"
            );
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            // Notify User
            notificationService.sendNotification(
                roleRequest.getUser().getId(),
                "Yêu cầu cấp quyền bị từ chối",
                "Lý do: " + adminNote,
                "DANGER",
                "/pending-approval"
            );
        }

        RoleRequest updated = roleRequestRepository.save(roleRequest);
        return mapToResponse(updated);
    }

    private RoleRequestResponseDTO mapToResponse(RoleRequest req) {
        return RoleRequestResponseDTO.builder()
                .id(req.getId())
                .username(req.getUser().getUsername())
                .fullName(req.getUser().getFullName())
                .requestedRoleName(req.getRequestedRole().getName())
                .reason(req.getReason())
                .status(req.getStatus())
                .adminNote(req.getAdminNote())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
