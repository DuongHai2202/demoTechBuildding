package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.project.AssignMemberRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.project.ProjectRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectMemberResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectResponseDTO;
import com.techbuildding.demoTechBuildding.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for Project management and member assignment.
 *
 * Features:
 * - CRUD operations for projects (with GPS + Geofencing)
 * - Assign/remove members to/from projects
 * - Geofencing check (verify user is within project radius)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Project controller", description = "APIs for project management, member assignment, and geofencing")
public class ProjectController {

    private final ProjectService projectService;

    // ==================== PROJECT CRUD ====================

    @Operation(summary = "Create a new project", description = "Create a project with GPS coordinates and geofencing radius.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<ProjectResponseDTO> createProject(@Valid @RequestBody ProjectRequestDTO request) {
        log.info("Create project: {}", request.getName());
        ProjectResponseDTO project = projectService.createProject(request);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Project created successfully", project);
    }

    @Operation(summary = "Get project by ID")
    @GetMapping("/{projectId}")
    public ResponseData<ProjectResponseDTO> getProjectById(
            @Parameter(description = "Project ID", example = "1") @PathVariable("projectId") Integer projectId) {
        ProjectResponseDTO project = projectService.getProjectById(projectId);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", project);
    }

    @Operation(summary = "Get all projects")
    @GetMapping
    public ResponseData<List<ProjectResponseDTO>> getAllProjects(
            @Parameter(description = "Filter by status", example = "IN_PROGRESS") @RequestParam(value = "status", required = false) String status) {
        List<ProjectResponseDTO> projects = (status != null)
                ? projectService.getProjectsByStatus(status)
                : projectService.getAllProjects();
        return new ResponseData<>(HttpStatus.OK.value(), "Success", projects);
    }

    @Operation(summary = "Update project", description = "Update project info, GPS coordinates, or geofencing radius.")
    @PutMapping("/{projectId}")
    public ResponseData<ProjectResponseDTO> updateProject(
            @Parameter(description = "Project ID", example = "1") @PathVariable("projectId") Integer projectId,
            @Valid @RequestBody ProjectRequestDTO request) {
        ProjectResponseDTO project = projectService.updateProject(projectId, request);
        return new ResponseData<>(HttpStatus.OK.value(), "Project updated successfully", project);
    }

    @Operation(summary = "Delete project")
    @DeleteMapping("/{projectId}")
    public ResponseData<Void> deleteProject(
            @Parameter(description = "Project ID", example = "1") @PathVariable("projectId") Integer projectId) {
        projectService.deleteProject(projectId);
        return new ResponseData<>(HttpStatus.OK.value(), "Project deleted successfully");
    }

    // ==================== MEMBER MANAGEMENT ====================

    @Operation(summary = "Assign a member to project", description = "Add a user to the project with a specific role (PM, ENGINEER, WORKER, SUPERVISOR).")
    @PostMapping("/{projectId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<ProjectMemberResponseDTO> assignMember(
            @Parameter(description = "Project ID", example = "1") @PathVariable("projectId") Integer projectId,
            @Valid @RequestBody AssignMemberRequestDTO request) {
        ProjectMemberResponseDTO member = projectService.assignMember(projectId, request);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Member assigned successfully", member);
    }

    @Operation(summary = "Remove a member from project", description = "Permanently remove a member from the project.")
    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseData<Void> removeMember(
            @Parameter(description = "Project ID", example = "1") @PathVariable("projectId") Integer projectId,
            @Parameter(description = "User ID to remove", example = "1") @PathVariable("userId") Long userId) {
        projectService.removeMember(projectId, userId);
        return new ResponseData<>(HttpStatus.OK.value(), "Member removed from project");
    }

    @Operation(summary = "Update member role", description = "Update the role of an existing project member.")
    @PutMapping("/{projectId}/members/{userId}")
    public ResponseData<ProjectMemberResponseDTO> updateMemberRole(
            @Parameter(description = "Project ID", example = "1") @PathVariable("projectId") Integer projectId,
            @Parameter(description = "User ID to update", example = "1") @PathVariable("userId") Long userId,
            @RequestParam("role") String role) {
        ProjectMemberResponseDTO member = projectService.updateMemberRole(projectId, userId, role);
        return new ResponseData<>(HttpStatus.OK.value(), "Member role updated successfully", member);
    }

    @Operation(summary = "Get all members of a project")
    @GetMapping("/{projectId}/members")
    public ResponseData<List<ProjectMemberResponseDTO>> getProjectMembers(
            @Parameter(description = "Project ID", example = "1") @PathVariable("projectId") Integer projectId) {
        List<ProjectMemberResponseDTO> members = projectService.getProjectMembers(projectId);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", members);
    }

    @Operation(summary = "Get projects by user", description = "Get all active projects that a user is assigned to.")
    @GetMapping("/user/{userId}")
    public ResponseData<List<ProjectResponseDTO>> getProjectsByUser(
            @Parameter(description = "User ID", example = "1") @PathVariable("userId") Long userId) {
        List<ProjectResponseDTO> projects = projectService.getProjectsByUserId(userId);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", projects);
    }

    // ==================== GEOFENCING ====================

    @Operation(summary = "Check geofencing", description = "Verify if the given GPS coordinates are within the project's geofencing radius. Used before check-in.")
    @GetMapping("/{projectId}/geofencing")
    public ResponseData<Map<String, Object>> checkGeofencing(
            @Parameter(description = "Project ID", example = "1") @PathVariable("projectId") Integer projectId,
            @Parameter(description = "User's latitude", example = "10.7322") @RequestParam("latitude") double latitude,
            @Parameter(description = "User's longitude", example = "106.7225") @RequestParam("longitude") double longitude) {

        boolean isInside = projectService.checkGeofencing(projectId, latitude, longitude);

        Map<String, Object> result = Map.of(
                "inside", isInside,
                "message", isInside ? "You are within the project area" : "You are outside the project area");

        return new ResponseData<>(HttpStatus.OK.value(), "Geofencing check completed", result);
    }
}
