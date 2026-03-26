package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.user.UserRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.entity.UserHasRole;
import com.techbuildding.demoTechBuildding.mapper.UserMapper;
import com.techbuildding.demoTechBuildding.repository.RoleRepository;
import com.techbuildding.demoTechBuildding.repository.UserHasRoleRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.UserService;
import com.techbuildding.demoTechBuildding.util.enums.UserStatus;
import com.techbuildding.demoTechBuildding.exception.DuplicateResourceException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserHasRoleRepository userHasRoleRepository;
    private final com.techbuildding.demoTechBuildding.repository.PartnerRepository partnerRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public UserResponseDTO createUser(UserRequestDTO request) {
        log.info("Creating user with username: {}", request.getUsername());

        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
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

        // Map roles if provided
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                roleRepository.findByName(roleName.toUpperCase()).ifPresent(role -> {
                    UserHasRole userHasRole = new UserHasRole();
                    userHasRole.setUser(savedUser);
                    userHasRole.setRole(role);
                    userHasRoleRepository.save(userHasRole);
                });
            }
        }
        log.info("User created successfully with id: {}", savedUser.getId());

        return userMapper.toResponseDTO(savedUser);
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        log.info("Fetching user by id: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        return userMapper.toResponseDTO(user);
    }

    @Override
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

        // Only update non-null fields
        if (request.getFullName() != null)
            existingUser.setFullName(request.getFullName());
        if (request.getPhone() != null)
            existingUser.setPhone(request.getPhone());
        if (request.getEmail() != null)
            existingUser.setEmail(request.getEmail());

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
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
            userHasRoleRepository.deleteByUserId(id);
            for (String roleName : request.getRoles()) {
                roleRepository.findByName(roleName.toUpperCase()).ifPresent(role -> {
                    UserHasRole userHasRole = new UserHasRole();
                    userHasRole.setUser(updatedUser);
                    userHasRole.setRole(role);
                    userHasRoleRepository.save(userHasRole);
                });
            }
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

        // Soft delete: mark as deleted, change status to INACTIVE
        user.setDeleted(true);
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);

        log.info("User soft deleted successfully with id: {}", id);
    }

    @Override
    @Transactional
    public UserResponseDTO saveFaceDescriptor(String username, String faceDescriptor) {
        log.info("Saving face descriptor for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Duplicate Check Logic
        if (faceDescriptor != null && !faceDescriptor.isBlank()) {
            try {
                double[] newDescriptor = objectMapper.readValue(faceDescriptor, double[].class);
                List<User> others = userRepository.findAllByFaceDescriptorIsNotNull();
                
                for (User other : others) {
                    // Skip if the same user is re-registering
                    if (other.getId().equals(user.getId())) continue;
                    
                    if (other.getFaceDescriptor() != null) {
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
            } catch (Exception e) {
                if (e instanceof DuplicateResourceException) throw (DuplicateResourceException) e;
                log.error("Error parsing face descriptor for duplicate check", e);
                // If it's just a parse error (bad data), we might want to let it through or fail, 
                // but let's just log and continue for now or wrap in RuntimeException
            }
        }

        user.setFaceDescriptor(faceDescriptor);
        userRepository.save(user);

        return userMapper.toResponseDTO(user);
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
