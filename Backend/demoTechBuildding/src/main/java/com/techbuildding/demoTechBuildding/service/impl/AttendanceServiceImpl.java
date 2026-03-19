package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.attendance.CheckInRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.CheckOutRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.LogFailureRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceResponseDTO;
import com.techbuildding.demoTechBuildding.entity.AttendanceLog;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.mapper.AttendanceMapper;
import com.techbuildding.demoTechBuildding.repository.AttendanceLogRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectMemberRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.AttendanceService;
import com.techbuildding.demoTechBuildding.service.StorageService;
import com.techbuildding.demoTechBuildding.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Implementation of AttendanceService.
 *
 * Check-in flow:
 * 1. Validate user and project exist
 * 2. Validate geofencing (user must be within radius)
 * 3. Check no active session (not already checked in)
 * 4. Upload selfie to MinIO (optional)
 * 5. Save AttendanceLog with status CHECKED_IN
 *
 * Check-out flow:
 * 1. Find active check-in session for user/project
 * 2. Upload selfie to MinIO (optional)
 * 3. Update record with check-out time, GPS, and status COMPLETED
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceLogRepository attendanceLogRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final AttendanceMapper attendanceMapper;
    private final StorageService storageService;

    @Override
    @Transactional
    public AttendanceResponseDTO checkIn(Long userId, CheckInRequestDTO request, MultipartFile selfie) {
        log.info("Check-in: userId={}, projectId={}", userId, request.getProjectId());

        validateUserPermission(userId);
        validateProjectMembership(userId, request.getProjectId());

        User user = findUserOrThrow(userId);
        Project project = findProjectOrThrow(request.getProjectId());

        // Validate geofencing
        validateGeofencing(project, request.getLatitude().doubleValue(), request.getLongitude().doubleValue());

        // Prevent duplicate check-in (active session)
        attendanceLogRepository
                .findByUserIdAndProjectIdAndCheckOutAtIsNull(userId, request.getProjectId())
                .ifPresent(log -> {
                    throw new RuntimeException("Bạn đang có một ca làm việc chưa kết thúc. Vui lòng Check-out trước.");
                });

        // Prevent re-check-in if a session was completed today
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        List<AttendanceLog> todayLogs = attendanceLogRepository
                .findByUserIdAndProjectIdAndCheckInAtBetween(userId, request.getProjectId(), startOfDay, endOfDay);

        if (!todayLogs.isEmpty()) {
            boolean hasCompleted = todayLogs.stream().anyMatch(l -> l.getCheckOutAt() != null);
            if (hasCompleted) {
                throw new RuntimeException("Bạn đã hoàn thành ca làm việc hôm nay cho dự án này và không thể đăng ký lại.");
            }
        }

        // Calculate distance from project center
        float distance = (float) GeoUtils.calculateDistance(
                project.getLatitude().doubleValue(),
                project.getLongitude().doubleValue(),
                request.getLatitude().doubleValue(),
                request.getLongitude().doubleValue());

        // Upload selfie if provided
        String selfieUrl = null;
        if (selfie != null && !selfie.isEmpty()) {
            selfieUrl = storageService.uploadFile(selfie, "attendance");
        }

        AttendanceLog attendanceLog = AttendanceLog.builder()
                .user(user)
                .project(project)
                .checkInAt(LocalDateTime.now())
                .gpsLatIn(request.getLatitude())
                .gpsLongIn(request.getLongitude())
                .distanceInMeters(distance)
                .selfieUrlIn(selfieUrl)
                .status("CHECKED_IN")
                .build();

        AttendanceLog saved = attendanceLogRepository.save(attendanceLog);
        log.info("Check-in successful: userId={}, projectId={}, distance={}m", userId, request.getProjectId(),
                distance);

        return attendanceMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public AttendanceResponseDTO checkOut(Long userId, Integer projectId, CheckOutRequestDTO request,
            MultipartFile selfie) {
        log.info("Check-out: userId={}, projectId={}", userId, projectId);

        validateUserPermission(userId);

        // Find active check-in session
        AttendanceLog activeLog = attendanceLogRepository
                .findByUserIdAndProjectIdAndCheckOutAtIsNull(userId, projectId)
                .orElseThrow(() -> new RuntimeException("No active check-in found. Please check in first."));

        // Upload selfie if provided
        String selfieUrl = null;
        if (selfie != null && !selfie.isEmpty()) {
            selfieUrl = storageService.uploadFile(selfie, "attendance");
        }

        // Update check-out info
        activeLog.setCheckOutAt(LocalDateTime.now());
        activeLog.setGpsLatOut(request.getLatitude());
        activeLog.setGpsLongOut(request.getLongitude());
        activeLog.setSelfieUrlOut(selfieUrl);
        activeLog.setStatus("COMPLETED");

        AttendanceLog updated = attendanceLogRepository.save(activeLog);
        log.info("Check-out successful: userId={}, projectId={}", userId, projectId);

        return attendanceMapper.toResponseDTO(updated);
    }

    @Override
    public List<AttendanceResponseDTO> getPersonalHistory(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Personal history: userId={}, {} to {}", userId, startDate, endDate);

        validateUserPermission(userId);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<AttendanceLog> logs = attendanceLogRepository.findAll()
                .stream()
                .filter(l -> l.getUser().getId().equals(userId)
                        && l.getCheckInAt() != null
                        && !l.getCheckInAt().isBefore(start)
                        && !l.getCheckInAt().isAfter(end))
                .toList();

        return attendanceMapper.toResponseDTOList(logs);
    }

    @Override
    public List<AttendanceResponseDTO> getProjectHistory(Integer projectId, LocalDate startDate, LocalDate endDate) {
        log.info("Project history: projectId={}, {} to {}", projectId, startDate, endDate);

        validateProjectAccess(projectId);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<AttendanceLog> logs = attendanceLogRepository
                .findByProjectIdAndCheckInAtBetween(projectId, start, end);

        return attendanceMapper.toResponseDTOList(logs);
    }

    @Override
    public AttendanceResponseDTO getTodayRecord(Long userId, Integer projectId) {
        validateUserPermission(userId);
        
        // 1. Check for active session first
        Optional<AttendanceLog> active = attendanceLogRepository
                .findByUserIdAndProjectIdAndCheckOutAtIsNull(userId, projectId);
        if (active.isPresent()) {
            return attendanceMapper.toResponseDTO(active.get());
        }

        // 2. Otherwise return any record today (completed)
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return attendanceLogRepository
                .findByUserIdAndProjectIdAndCheckInAtBetween(userId, projectId, startOfDay, endOfDay)
                .stream()
                .sorted((a, b) -> b.getCheckInAt().compareTo(a.getCheckInAt()))
                .findFirst()
                .map(attendanceMapper::toResponseDTO)
                .orElse(null);
    }

    @Override
    public List<AttendanceResponseDTO> getAllLogs(LocalDate startDate, LocalDate endDate) {
        log.info("Global history: {} to {}", startDate, endDate);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        List<AttendanceLog> logs = attendanceLogRepository.findByCheckInAtBetween(start, end);
        return attendanceMapper.toResponseDTOList(logs);
    }

    @Override
    @Transactional
    public void logFailure(LogFailureRequestDTO request) {
        log.info("Log failure: userId={}, projectId={}, reason={}", request.getUserId(), request.getProjectId(), request.getReason());

        User user = findUserOrThrow(request.getUserId());
        Project project = findProjectOrThrow(request.getProjectId());

        AttendanceLog failLog = AttendanceLog.builder()
                .user(user)
                .project(project)
                .checkInAt(LocalDateTime.now())
                .gpsLatIn(request.getLatitude())
                .gpsLongIn(request.getLongitude())
                .status("FAILED")
                .remarks(request.getReason())
                .build();

        attendanceLogRepository.save(failLog);
    }

    // ===== HELPERS =====

    private void validateGeofencing(Project project, double userLat, double userLon) {
        if (project.getLatitude() == null || project.getLongitude() == null) {
            log.warn("Project {} has no GPS configured, skipping geofencing", project.getId());
            return;
        }

        boolean isInside = GeoUtils.isWithinRadius(
                project.getLatitude().doubleValue(),
                project.getLongitude().doubleValue(),
                project.getRadiusMeters(),
                userLat, userLon);

        if (!isInside) {
            double distance = GeoUtils.calculateDistance(
                    project.getLatitude().doubleValue(),
                    project.getLongitude().doubleValue(),
                    userLat, userLon);
            throw new RuntimeException(String.format(
                    "You are %.0f meters away from the project site. Maximum allowed: %d meters.",
                    distance, project.getRadiusMeters()));
        }
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    private Project findProjectOrThrow(Integer projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
    }

    // ===== SECURITY HELPERS =====

    private void validateUserPermission(Long requestedUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("Not authenticated");

        // Admin and Global PM can act on behalf of anyone
        boolean isManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PM"));
        
        if (isManager) return;

        // Otherwise, requestedUserId must match the authenticated user
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        
        if (!Objects.equals(currentUser.getId(), requestedUserId)) {
            throw new RuntimeException("Access denied: You can only manage your own attendance records.");
        }
    }

    private void validateProjectMembership(Long userId, Integer projectId) {
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
        if (!isMember) {
            throw new RuntimeException("Access denied: User is not a member of this project.");
        }
    }

    private void validateProjectAccess(Integer projectId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("Not authenticated");

        // Admin and Global PM can view any project
        boolean isManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PM"));
        if (isManager) return;

        // Staff must be a member of the project AND have PM/SUPERVISOR role in that project to view history
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        
        projectMemberRepository.findByProjectIdAndUserId(projectId, currentUser.getId())
                .ifPresentOrElse(member -> {
                    String role = member.getAssignedRole();
                    if (role == null || !List.of("PM", "SUPERVISOR", "ENGINEER").contains(role)) {
                        throw new RuntimeException("Access denied: You do not have permission to view this project history.");
                    }
                }, () -> {
                    throw new RuntimeException("Access denied: You are not a member of this project.");
                });
    }
}
