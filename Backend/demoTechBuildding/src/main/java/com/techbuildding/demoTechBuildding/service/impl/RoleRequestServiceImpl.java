package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.user.RoleRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.RoleRequestResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Role;
import com.techbuildding.demoTechBuildding.entity.RoleRequest;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.entity.UserHasRole;
import com.techbuildding.demoTechBuildding.repository.*;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.exception.ProtectedResourceException;
import com.techbuildding.demoTechBuildding.service.RoleRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleRequestServiceImpl implements RoleRequestService {

    private static final Set<String> REQUESTABLE_ROLES = Set.of("STAFF", "PM", "PARTNER");
    private static final Set<String> DECISION_STATUSES = Set.of("APPROVED", "REJECTED");

    private final RoleRequestRepository roleRequestRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserHasRoleRepository userHasRoleRepository;
    private final com.techbuildding.demoTechBuildding.service.NotificationService notificationService;

    @Override
    @Transactional
    public RoleRequestResponseDTO createRequest(Long userId, RoleRequestDTO request) {
        if (request == null) {
            throw new BadRequestException("Vui lòng chọn vai trò và nhập lý do xin quyền.");
        }

        String requestedRoleName = normalize(request.getRoleName());
        String reason = request.getReason() == null ? "" : request.getReason().trim();
        if (!REQUESTABLE_ROLES.contains(requestedRoleName)) {
            throw new BadRequestException("Vai trò xin cấp không hợp lệ. Vui lòng chọn Nhân viên, Quản lý dự án hoặc Đối tác.");
        }
        if (reason.length() < 10) {
            throw new BadRequestException("Lý do xin quyền cần có ít nhất 10 ký tự để quản trị viên xem xét.");
        }
        if (reason.length() > 500) {
            throw new BadRequestException("Lý do xin quyền không được vượt quá 500 ký tự.");
        }

        log.info("Creating role request for user id: {} to role: {}", userId, requestedRoleName);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy tài khoản để gửi yêu cầu."));

        roleRequestRepository.findFirstByUserIdAndStatusIgnoreCaseOrderByCreatedAtDesc(userId, "PENDING")
                .ifPresent(existing -> {
                    throw new BadRequestException("Bạn đã có một yêu cầu đang chờ duyệt. Vui lòng chờ quản trị viên xử lý trước khi gửi yêu cầu mới.");
                });
        
        Role role = roleRepository.findByName(requestedRoleName)
                .orElseThrow(() -> new BadRequestException("Vai trò được chọn hiện chưa được cấu hình trong hệ thống."));

        RoleRequest roleRequest = RoleRequest.builder()
                .user(user)
                .requestedRole(role)
                .reason(reason)
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
    @Transactional(readOnly = true)
    public List<RoleRequestResponseDTO> getRequestsForUser(Long userId) {
        return roleRequestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleRequestResponseDTO> getAllRequests() {
        return roleRequestRepository.findAll(org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoleRequestResponseDTO updateRequestStatus(Long requestId, String status, String adminNote) {
        String normalizedStatus = normalize(status);
        if (!DECISION_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Trạng thái xử lý không hợp lệ. Vui lòng chọn phê duyệt hoặc từ chối.");
        }
        String normalizedNote = adminNote == null ? "" : adminNote.trim();
        if ("REJECTED".equals(normalizedStatus) && normalizedNote.length() < 3) {
            throw new BadRequestException("Vui lòng nhập lý do từ chối để người yêu cầu biết cách bổ sung thông tin.");
        }

        log.info("Updating role request id: {} to status: {}", requestId, normalizedStatus);
        
        RoleRequest roleRequest = roleRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy yêu cầu cấp quyền hoặc yêu cầu đã bị xóa."));

        if (!"PENDING".equalsIgnoreCase(roleRequest.getStatus())) {
            throw new BadRequestException("Yêu cầu cấp quyền này đã được xử lý trước đó.");
        }

        roleRequest.setStatus(normalizedStatus);
        roleRequest.setAdminNote(normalizedNote.isBlank() ? null : normalizedNote);

        if ("APPROVED".equals(normalizedStatus)) {
            // Assign the new role to the user
            User user = roleRequest.getUser();
            Role role = roleRequest.getRequestedRole();

            if ("admin".equalsIgnoreCase(user.getUsername()) && !"ADMIN".equals(role.getName())) {
                throw new ProtectedResourceException("Tài khoản quản trị hệ thống admin được bảo vệ và không thể hạ cấp.");
            }

            // The account model has exactly one global role. Replacing the
            // existing assignment prevents permission unions such as
            // GUEST + STAFF or STAFF + PM after an approval.
            userHasRoleRepository.deleteByUserId(user.getId());
            user.getUserHasRoles().clear();
            UserHasRole userHasRole = UserHasRole.builder()
                    .user(user)
                    .role(role)
                    .build();
            user.getUserHasRoles().add(userHasRole);
            userHasRoleRepository.save(userHasRole);
            log.info("Role {} assigned as the only role for user {}", role.getName(), user.getUsername());

            // Notify User
            notificationService.sendNotification(
                user.getId(),
                "Yêu cầu cấp quyền đã được duyệt",
                "Bạn đã được cấp quyền: " + role.getName(),
                "SUCCESS",
                "/"
            );
        } else if ("REJECTED".equals(normalizedStatus)) {
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

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
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
