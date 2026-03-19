package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.project.AssignMemberRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.project.ProjectRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectMemberResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectResponseDTO;

import java.util.List;

/**
 * Service interface for Project and ProjectMember operations.
 */
public interface ProjectService {

    // ===== Project CRUD =====
    ProjectResponseDTO createProject(ProjectRequestDTO request);

    ProjectResponseDTO getProjectById(Integer projectId);

    List<ProjectResponseDTO> getAllProjects();

    List<ProjectResponseDTO> getProjectsByStatus(String status);

    ProjectResponseDTO updateProject(Integer projectId, ProjectRequestDTO request);

    void deleteProject(Integer projectId);

    // ===== Project Member Management =====
    ProjectMemberResponseDTO assignMember(Integer projectId, AssignMemberRequestDTO request);

    ProjectMemberResponseDTO updateMemberRole(Integer projectId, Long userId, String newRole);

    void removeMember(Integer projectId, Long userId);

    List<ProjectMemberResponseDTO> getProjectMembers(Integer projectId);

    List<ProjectResponseDTO> getProjectsByUserId(Long userId);

    // ===== Geofencing =====
    boolean checkGeofencing(Integer projectId, double userLat, double userLon);
}
