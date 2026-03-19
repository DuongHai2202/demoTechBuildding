package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.user.UserRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;

import java.util.List;

/**
 * Service interface for User management operations.
 */
public interface UserService {

    UserResponseDTO createUser(UserRequestDTO request);

    UserResponseDTO getUserById(Long id);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO updateUser(Long id, UserRequestDTO request);

    void deleteUser(Long id);

    UserResponseDTO saveFaceDescriptor(String username, String faceDescriptor);
}
