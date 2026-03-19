package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.user.UserRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.user.UserResponseDTO;
import com.techbuildding.demoTechBuildding.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User controller", description = "APIs for managing system users")
public class UserController {

    private final UserService userService;

    /**
     * POST /api/v1/users - Create a new user
     */
    @Operation(summary = "Create a new user", description = "Register a new user account. Username and email must be unique.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO request) {
        log.info("Request to create user: {}", request.getUsername());

        UserResponseDTO user = userService.createUser(request);

        log.info("User created successfully: {}", user.getUsername());
        return new ResponseData<>(HttpStatus.CREATED.value(), "User created successfully", user);
    }

    /**
     * GET /api/v1/users/{id} - Get user by ID
     */
    @Operation(summary = "Get user by ID", description = "Retrieve detailed user information including assigned roles.")
    @GetMapping("/{userId}")
    public ResponseData<UserResponseDTO> getUserById(
            @Parameter(description = "User ID", example = "1") @PathVariable("userId") Long userId) {
        log.info("Request to get user by id: {}", userId);

        UserResponseDTO user = userService.getUserById(userId);
        return new ResponseData<>(HttpStatus.OK.value(), "User retrieved successfully", user);
    }

    /**
     * GET /api/v1/users - Get all users
     */
    @Operation(summary = "Get all users", description = "Retrieve a list of all users in the system.")
    @GetMapping
    public ResponseData<List<UserResponseDTO>> getAllUsers() {
        log.info("Request to get all users");

        List<UserResponseDTO> users = userService.getAllUsers();
        return new ResponseData<>(HttpStatus.OK.value(), "Users retrieved successfully", users);
    }

    /**
     * PUT /api/v1/users/{id} - Update user
     */
    @Operation(summary = "Update user information", description = "Update for user.")
    @PutMapping("/{userId}")
    public ResponseData<UserResponseDTO> updateUser(
            @Parameter(description = "User ID to update", example = "1") @PathVariable("userId") Long userId,
            @Valid @RequestBody UserRequestDTO request) {
        log.info("Request to update user id: {}", userId);

        UserResponseDTO user = userService.updateUser(userId, request);

        log.info("User updated successfully: {}", userId);
        return new ResponseData<>(HttpStatus.OK.value(), "User updated successfully", user);
    }

    /**
     * DELETE /api/v1/users/{id} - Delete user
     */
    @Operation(summary = "Delete a user", description = "Mark the user as deleted instead of permanently removing from the database.")
    @DeleteMapping("/{userId}")
    public ResponseData<Void> deleteUser(
            @Parameter(description = "User ID to delete", example = "1") @PathVariable("userId") Long userId) {
        log.info("Request to delete user id: {}", userId);

        userService.deleteUser(userId);

        log.info("User deleted successfully: {}", userId);
        return new ResponseData<>(HttpStatus.OK.value(), "User deleted successfully");
    }

    /**
     * POST /api/v1/users/me/face-descriptor - Save face descriptor
     */
    @Operation(summary = "Save face descriptor", description = "Save the 128-dimensional face descriptor array from face-api.js.")
    @PostMapping("/me/face-descriptor")
    public ResponseData<UserResponseDTO> saveMyFaceDescriptor(@RequestBody java.util.Map<String, Object> body) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Request to save face descriptor for user: {}", username);

        String faceDescriptor = null;
        if (body.get("faceDescriptor") != null) {
            faceDescriptor = body.get("faceDescriptor").toString(); // Store as raw text
        }

        UserResponseDTO user = userService.saveFaceDescriptor(username, faceDescriptor);
        return new ResponseData<>(HttpStatus.OK.value(), "Face descriptor saved successfully", user);
    }
}
