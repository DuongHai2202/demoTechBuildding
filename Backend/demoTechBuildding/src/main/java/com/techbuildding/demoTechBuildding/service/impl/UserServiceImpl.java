package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.user.UserRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.FaceVerificationDataDTO;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.entity.Role;
import com.techbuildding.demoTechBuildding.entity.UserHasRole;
import com.techbuildding.demoTechBuildding.mapper.UserMapper;
import com.techbuildding.demoTechBuildding.repository.RoleRepository;
import com.techbuildding.demoTechBuildding.repository.UserHasRoleRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.UserService;
import com.techbuildding.demoTechBuildding.service.OtpService;
import com.techbuildding.demoTechBuildding.security.JwtTokenProvider;
import com.techbuildding.demoTechBuildding.util.enums.UserStatus;
import com.techbuildding.demoTechBuildding.exception.DuplicateResourceException;
import com.techbuildding.demoTechBuildding.exception.ProtectedResourceException;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.EntityManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final String PROTECTED_ADMIN_USERNAME = "admin";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserHasRoleRepository userHasRoleRepository;
    private final com.techbuildding.demoTechBuildding.repository.PartnerRepository partnerRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final EntityManager entityManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final OtpService otpService;

    @Override
    @Transactional
    public UserResponseDTO createUser(UserRequestDTO request) {
        // Validate required fields
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Tên đăng nhập không được để trống");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Mật khẩu không được để trống");
        }
        if (request.getPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
        }

        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại: " + request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail().trim())) {
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        // Map DTO to Entity
        User user = userMapper.toEntity(request);

        // Set fields that mapper ignores
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        if (request.getStatus() != null) {
            user.setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        // Assign partner if provided
        if (request.getPartnerId() != null) {
            partnerRepository.findById(request.getPartnerId()).ifPresent(user::setPartner);
        }

        // Persist to database
        User savedUser = userRepository.save(user);

        // Default to the least-privileged role when the administrator does not
        // explicitly select a role.
        String requestedRole = resolveSingleRole(request.getRoles(), true);
        Role role = roleRepository.findByName(requestedRole)
                .orElseThrow(() -> new RuntimeException("Vai trò không tồn tại: " + requestedRole));
        UserHasRole userHasRole = new UserHasRole();
        userHasRole.setUser(savedUser);
        userHasRole.setRole(role);
        savedUser.getUserHasRoles().add(userHasRole);
        userHasRoleRepository.save(userHasRole);
        log.info("User created successfully with id: {}", savedUser.getId());

        return userMapper.toResponseDTO(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        log.info("Fetching user by id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        return userMapper.toResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        log.info("Fetching all users");

        List<User> users = userRepository.findAll();
        return userMapper.toResponseDTOList(users);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UserRequestDTO request) {
        log.info("Updating user with id: {}", id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        assertMutable(existingUser);

        // Update username if provided
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(existingUser.getUsername()) && userRepository.existsByUsername(newUsername)) {
                throw new RuntimeException("Tên đăng nhập đã tồn tại: " + newUsername);
            }
            existingUser.setUsername(newUsername);
        }

        // Only update non-null fields
        if (request.getFullName() != null)
            existingUser.setFullName(request.getFullName());
        if (request.getPhone() != null)
            existingUser.setPhone(request.getPhone());
        if (request.getEmail() != null)
            existingUser.setEmail(request.getEmail());

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 6) {
                throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
            }
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update status if provided
        if (request.getStatus() != null) {
            existingUser.setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
        }

        // Update partner if provided
        if (request.getPartnerId() != null) {
            partnerRepository.findById(request.getPartnerId()).ifPresent(existingUser::setPartner);
        }

        User updatedUser = userRepository.save(existingUser);

        // Update roles - simple "clear and re-add" approach for robustness
        if (request.getRoles() != null) {
            String requestedRole = resolveSingleRole(request.getRoles(), false);
            Role role = roleRepository.findByName(requestedRole)
                    .orElseThrow(() -> new RuntimeException("Vai trò không tồn tại: " + requestedRole));
            userHasRoleRepository.deleteByUserId(id);
            UserHasRole userHasRole = new UserHasRole();
            userHasRole.setUser(updatedUser);
            userHasRole.setRole(role);
            updatedUser.getUserHasRoles().clear();
            updatedUser.getUserHasRoles().add(userHasRole);
            userHasRoleRepository.save(userHasRole);
        }
        log.info("User updated successfully with id: {}", id);

        return userMapper.toResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        log.info("Soft deleting user with id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        assertMutable(user);

        // Soft delete: mark as deleted, change status to INACTIVE
        user.setDeleted(true);
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        invalidateUserSessions(user);

        log.info("User soft deleted successfully with id: {}", id);
    }

    @Override
    @Transactional
    public void restoreUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        assertMutable(user);
        if (!user.isDeleted()) {
            throw new RuntimeException("Tài khoản chưa bị xóa mềm");
        }

        user.setDeleted(false);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        log.info("User restored successfully with id: {}", id);
    }

    @Override
    @Transactional
    public void hardDeleteUser(Long id) {
        log.warn("Permanently deleting user with id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        assertMutable(user);
        invalidateUserSessions(user);
        otpService.clearOtp(user.getId(), "REGISTER");

        // Clear nullable references first, then remove records with a strict
        // foreign key. This keeps the operation valid even when old migration
        // versions did not configure ON DELETE CASCADE consistently.
        execute("UPDATE tbl_design_sheets SET issued_by = NULL WHERE issued_by = :userId", id);
        execute("UPDATE tbl_rfis SET assigned_to = NULL WHERE assigned_to = :userId", id);
        execute("UPDATE tbl_material_requests SET approved_by = NULL, checked_by = NULL WHERE approved_by = :userId OR checked_by = :userId", id);
        execute("UPDATE tbl_work_logs SET approved_by = NULL, checked_by = NULL WHERE approved_by = :userId OR checked_by = :userId", id);

        execute("DELETE FROM tbl_attendance_logs WHERE user_id = :userId", id);
        execute("DELETE FROM tbl_contract_attachments WHERE uploaded_by = :userId", id);
        execute("DELETE FROM tbl_digital_signatures WHERE signer_id = :userId", id);
        execute("DELETE FROM tbl_material_requests WHERE requester_id = :userId", id);
        execute("DELETE FROM tbl_work_logs WHERE user_id = :userId", id);
        execute("DELETE FROM tbl_submission_steps WHERE processor_id = :userId", id);
        execute("DELETE FROM tbl_rfi_comments WHERE user_id = :userId", id);
        execute("DELETE FROM tbl_role_requests WHERE user_id = :userId", id);
        execute("DELETE FROM tbl_project_members WHERE user_id = :userId", id);
        execute("DELETE FROM tbl_notifications WHERE user_id = :userId", id);
        execute("DELETE FROM tbl_user_has_roles WHERE user_id = :userId", id);
        execute("DELETE FROM tbl_users WHERE id = :userId", id);

        entityManager.clear();
        log.warn("User permanently deleted with id: {}", id);
    }

    @Override
    @Transactional
    public UserResponseDTO saveFaceDescriptor(String username, String faceDescriptor) {
        log.info("Saving face descriptor for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Face enrollment is personal biometric data. The protected system
        // admin may enroll/update its own descriptor through the /me endpoint;
        // account identity, password, role and deletion remain protected by
        // assertMutable in the administration flows.

        // Duplicate Check Logic
        if (faceDescriptor == null || faceDescriptor.isBlank()) {
            throw new BadRequestException("Dữ liệu khuôn mặt không được để trống. Vui lòng quét lại.");
        }

        if (faceDescriptor != null && !faceDescriptor.isBlank()) {
            try {
                double[] newDescriptor = objectMapper.readValue(faceDescriptor, double[].class);
                if (newDescriptor.length != 128 || java.util.Arrays.stream(newDescriptor).anyMatch(value -> !Double.isFinite(value))) {
                    throw new BadRequestException("Dữ liệu khuôn mặt không hợp lệ. Vui lòng quét lại.");
                }
                List<User> others = userRepository.findAllByFaceDescriptorIsNotNull();
                
                for (User other : others) {
                    // Skip if the same user is re-registering
                    if (other.getId().equals(user.getId())) continue;
                    
                    if (other.getFaceDescriptor() != null && !other.getFaceDescriptor().isBlank()) {
                        double[] existingDescriptor = objectMapper.readValue(other.getFaceDescriptor(), double[].class);
                        double distance = calculateEuclideanDistance(newDescriptor, existingDescriptor);
                        
                        log.debug("Face similarity check: distance = {} between {} and {}", distance, user.getUsername(), other.getUsername());
                        
                        // Threshold 0.6 is standard for face-api.js. Smaller means more similar.
                        if (distance < 0.6) {
                            log.warn("Duplicate face detected: User {} is too similar to {}", user.getUsername(), other.getUsername());
                            throw new DuplicateResourceException("Khuôn mặt này đã được đăng ký bởi nhân viên khác (" + other.getFullName() + ")");
                        }
                    }
                }
            } catch (DuplicateResourceException | BadRequestException e) {
                throw e;
            } catch (Exception e) {
                log.error("Error parsing face descriptor for duplicate check", e);
                throw new BadRequestException("Dữ liệu khuôn mặt không hợp lệ. Vui lòng quét lại.");
            }
        }

        user.setFaceDescriptor(faceDescriptor);
        userRepository.save(user);

        return userMapper.toResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public FaceVerificationDataDTO getMyFaceVerificationData(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        String descriptor = user.getFaceDescriptor();
        return new FaceVerificationDataDTO(
                descriptor != null && !descriptor.isBlank(),
                descriptor);
    }

    private void assertMutable(User user) {
        if (user != null && PROTECTED_ADMIN_USERNAME.equalsIgnoreCase(user.getUsername())) {
            throw new ProtectedResourceException(
                    "Tài khoản quản trị hệ thống admin được bảo vệ và không thể chỉnh sửa thông tin, đổi mật khẩu hoặc xóa.");
        }
    }

    private String resolveSingleRole(List<String> roles, boolean defaultGuest) {
        if (roles == null || roles.isEmpty()) {
            if (defaultGuest) return "GUEST";
            throw new BadRequestException("Tài khoản phải có đúng một vai trò");
        }

        List<String> normalizedRoles = roles.stream()
                .filter(role -> role != null && !role.isBlank())
                .map(role -> role.trim().toUpperCase())
                .distinct()
                .toList();
        if (normalizedRoles.size() != 1) {
            throw new BadRequestException("Tài khoản chỉ được cấp đúng một vai trò");
        }
        return normalizedRoles.get(0);
    }

    private void invalidateUserSessions(User user) {
        jwtTokenProvider.removeRefreshToken(user.getUsername());
    }

    private void execute(String sql, Long userId) {
        entityManager.createNativeQuery(sql)
                .setParameter("userId", userId)
                .executeUpdate();
    }

    private double calculateEuclideanDistance(double[] v1, double[] v2) {
        if (v1.length != v2.length) return 1.0; // Max distance
        double sum = 0;
        for (int i = 0; i < v1.length; i++) {
            sum += Math.pow(v1[i] - v2[i], 2);
        }
        return Math.sqrt(sum);
    }
}
