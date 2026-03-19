package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.project.AssignMemberRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.project.ProjectRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectMemberResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectResponseDTO;
import com.techbuildding.demoTechBuildding.entity.*;
import com.techbuildding.demoTechBuildding.mapper.ProjectMapper;
import com.techbuildding.demoTechBuildding.repository.*;
import com.techbuildding.demoTechBuildding.service.ProjectService;
import com.techbuildding.demoTechBuildding.util.GeoUtils;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Implementation of ProjectService.
 *
 * Handles:
 * - Project CRUD with GPS + Geofencing
 * - Assign/remove members to/from projects
 * - Geofencing check using Haversine formula
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;
    private final EntityManager entityManager;

    // ===== PROJECT CRUD =====

    @Override
    @Transactional
    public ProjectResponseDTO createProject(ProjectRequestDTO request) {
        log.info("Creating project: {}", request.getName());

        Project project = projectMapper.toEntity(request);
        if (project.getStatus() == null) {
            project.setStatus("PLANNING");
        }
        if (project.getRadiusMeters() == null) {
            project.setRadiusMeters(100);
        }

        Project saved = projectRepository.save(project);
        log.info("Project created with id: {}", saved.getId());

        return projectMapper.toResponseDTO(saved);
    }

    @Override
    public ProjectResponseDTO getProjectById(Integer projectId) {
        log.info("Fetching project by id: {}", projectId);

        Project project = findProjectOrThrow(projectId);
        return projectMapper.toResponseDTO(project);
    }


    @Override
    public List<ProjectResponseDTO> getAllProjects() {
        log.info("Fetching all projects based on user roles");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return Collections.emptyList();

        boolean isManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PM"));

        if (isManager) {
            return projectMapper.toResponseDTOList(projectRepository.findAll());
        }

        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) return Collections.emptyList();

        List<ProjectMember> memberships = projectMemberRepository.findByUserId(user.getId());
        List<Project> projects = memberships.stream()
                .filter(ProjectMember::isActive)
                .map(ProjectMember::getProject)
                .collect(Collectors.toList());

        return projectMapper.toResponseDTOList(projects);
    }

    @Override
    public List<ProjectResponseDTO> getProjectsByStatus(String status) {
        log.info("Fetching projects by status based on user roles: {}", status);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return Collections.emptyList();

        boolean isManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PM"));

        if (isManager) {
            return projectMapper.toResponseDTOList(projectRepository.findByStatus(status));
        }

        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) return Collections.emptyList();

        List<ProjectMember> memberships = projectMemberRepository.findByUserId(user.getId());
        List<Project> projects = memberships.stream()
                .filter(ProjectMember::isActive)
                .map(ProjectMember::getProject)
                .filter(p -> status.equals(p.getStatus()))
                .collect(Collectors.toList());

        return projectMapper.toResponseDTOList(projects);
    }

    @Override
    @Transactional
    public ProjectResponseDTO updateProject(Integer projectId, ProjectRequestDTO request) {
        log.info("Updating project id: {}", projectId);

        Project project = findProjectOrThrow(projectId);

        // Update fields
        if (request.getName() != null)
            project.setName(request.getName());
        if (request.getProjectCode() != null)
            project.setProjectCode(request.getProjectCode());
        if (request.getDescription() != null)
            project.setDescription(request.getDescription());
        if (request.getAddress() != null)
            project.setAddress(request.getAddress());
        if (request.getLatitude() != null)
            project.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)
            project.setLongitude(request.getLongitude());
        if (request.getRadiusMeters() != null)
            project.setRadiusMeters(request.getRadiusMeters());
        if (request.getStartDate() != null)
            project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            project.setEndDate(request.getEndDate());
        if (request.getStatus() != null)
            project.setStatus(request.getStatus());

        Project updated = projectRepository.save(project);
        log.info("Project updated: {}", projectId);

        return projectMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteProject(Integer projectId) {
        log.info("Deleting project id: {} with cascade", projectId);

        Project project = findProjectOrThrow(projectId);

        // Use native queries to cascade-delete all child entities in correct order
        // Level 3: MaterialNorms (depend on BoqItems)
        entityManager.createNativeQuery(
            "DELETE mn FROM tbl_material_norms mn " +
            "INNER JOIN tbl_boq_items bi ON mn.boq_item_id = bi.id " +
            "INNER JOIN tbl_contracts c ON bi.contract_id = c.id " +
            "WHERE c.project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();

        // Level 2: BoqItems (depend on Contracts)
        entityManager.createNativeQuery(
            "DELETE bi FROM tbl_boq_items bi " +
            "INNER JOIN tbl_contracts c ON bi.contract_id = c.id " +
            "WHERE c.project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();

        // Level 2: ContractAttachments (depend on Contracts)
        entityManager.createNativeQuery(
            "DELETE ca FROM tbl_contract_attachments ca " +
            "INNER JOIN tbl_contracts c ON ca.contract_id = c.id " +
            "WHERE c.project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();

        // Level 2: ContractMaterialLimits (depend on Contracts)
        entityManager.createNativeQuery(
            "DELETE cml FROM tbl_contract_material_limits cml " +
            "INNER JOIN tbl_contracts c ON cml.contract_id = c.id " +
            "WHERE c.project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();

        // Level 2: BidSubmissions (depend on BiddingPackages)
        entityManager.createNativeQuery(
            "DELETE bs FROM tbl_bid_submissions bs " +
            "INNER JOIN tbl_bidding_packages bp ON bs.package_id = bp.id " +
            "WHERE bp.project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();

        // Level 2: Drawings linked to contracts of this project
        entityManager.createNativeQuery(
            "DELETE FROM tbl_drawings WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();

        // Level 1: Direct children of Project
        entityManager.createNativeQuery("DELETE FROM tbl_contracts WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_bidding_packages WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_zones WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_material_requests WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_technical_standards WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_project_members WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_project_slides WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_master_plans WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_design_sheets WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_submissions WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_rfis WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_work_logs WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM tbl_attendance_logs WHERE project_id = :pid")
            .setParameter("pid", projectId).executeUpdate();

        // Finally delete the project itself
        projectRepository.delete(project);

        log.info("Project deleted with all children: {}", projectId);
    }

    // ===== PROJECT MEMBER MANAGEMENT =====

    @Override
    @Transactional
    public ProjectMemberResponseDTO assignMember(Integer projectId, AssignMemberRequestDTO request) {
        log.info("Assigning user {} to project {} as {}", request.getUserId(), projectId, request.getAssignedRole());

        Project project = findProjectOrThrow(projectId);
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        // Check duplicates
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, request.getUserId())) {
            throw new RuntimeException("User is already assigned to this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .assignedRole(request.getAssignedRole())
                .active(true)
                .joinedAt(LocalDateTime.now())
                .build();

        ProjectMember saved = projectMemberRepository.save(member);
        log.info("Member assigned: userId={} to projectId={}", request.getUserId(), projectId);

        return projectMapper.toMemberResponseDTO(saved);
    }

    @Override
    @Transactional
    public ProjectMemberResponseDTO updateMemberRole(Integer projectId, Long userId, String newRole) {
        log.info("Updating role for user {} in project {} to {}", userId, projectId, newRole);

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found in project"));

        member.setAssignedRole(newRole);
        ProjectMember updated = projectMemberRepository.save(member);

        log.info("Member role updated: userId={}, projectId={}, role={}", userId, projectId, newRole);
        return projectMapper.toMemberResponseDTO(updated);
    }

    @Override
    @Transactional
    public void removeMember(Integer projectId, Long userId) {
        log.info("Removing user {} from project {}", userId, projectId);

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found in project"));

        projectMemberRepository.delete(member);

        log.info("Member removed (permanently): userId={}, projectId={}", userId, projectId);
    }

    @Override
    public List<ProjectMemberResponseDTO> getProjectMembers(Integer projectId) {
        log.info("Fetching members of project: {}", projectId);

        findProjectOrThrow(projectId);
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        return projectMapper.toMemberResponseDTOList(members);
    }

    @Override
    public List<ProjectResponseDTO> getProjectsByUserId(Long userId) {
        log.info("Fetching projects for user: {}", userId);

        List<ProjectMember> memberships = projectMemberRepository.findByUserId(userId);
        List<Project> projects = memberships.stream()
                .filter(ProjectMember::isActive)
                .map(ProjectMember::getProject)
                .collect(Collectors.toList());

        return projectMapper.toResponseDTOList(projects);
    }

    // ===== GEOFENCING =====

    @Override
    public boolean checkGeofencing(Integer projectId, double userLat, double userLon) {
        Project project = findProjectOrThrow(projectId);

        if (project.getLatitude() == null || project.getLongitude() == null) {
            throw new RuntimeException("Project GPS coordinates are not configured");
        }

        boolean isInside = GeoUtils.isWithinRadius(
                project.getLatitude().doubleValue(),
                project.getLongitude().doubleValue(),
                project.getRadiusMeters(),
                userLat, userLon);

        double distance = GeoUtils.calculateDistance(
                project.getLatitude().doubleValue(),
                project.getLongitude().doubleValue(),
                userLat, userLon);

        log.info("Geofencing check: projectId={}, distance={}m, radius={}m, inside={}",
                projectId, String.format("%.1f", distance), project.getRadiusMeters(), isInside);

        return isInside;
    }

    // ===== HELPER =====

    private Project findProjectOrThrow(Integer projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
    }
}
