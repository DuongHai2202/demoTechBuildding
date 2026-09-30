package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.attendance.CheckInRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.CheckOutRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.LogFailureRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.OvertimeReviewRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceResponseDTO;
import com.techbuildding.demoTechBuildding.entity.AttendanceLog;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.ShiftAssignment;
import com.techbuildding.demoTechBuildding.entity.ShiftTemplate;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.mapper.AttendanceMapper;
import com.techbuildding.demoTechBuildding.repository.AttendanceLogRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectMemberRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.AttendanceService;
import com.techbuildding.demoTechBuildding.service.ShiftService;
import com.techbuildding.demoTechBuildding.service.StorageService;
import com.techbuildding.demoTechBuildding.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;
import java.time.ZoneId;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

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

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final double MAX_GPS_ACCURACY_METERS = 150.0;
    private static final Duration MAX_ATTENDANCE_SESSION = Duration.ofHours(24);
    private static final Set<String> COMPLETED_STATUSES = Set.of("COMPLETED");
    private static final String OVERTIME_NONE = "NONE";
    private static final String OVERTIME_PENDING = "PENDING";
    private static final String OVERTIME_APPROVED = "APPROVED";
    private static final String OVERTIME_REJECTED = "REJECTED";

    private final AttendanceLogRepository attendanceLogRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final AttendanceMapper attendanceMapper;
    private final StorageService storageService;
    private final ShiftService shiftService;

    @Override
    @Transactional
    public AttendanceResponseDTO checkIn(Long userId, CheckInRequestDTO request, MultipartFile selfie) {
        log.info("Check-in: userId={}, projectId={}", userId, request.getProjectId());

        validateCoordinates(request.getLatitude(), request.getLongitude(), request.getAccuracy());
        validateUserPermission(userId);
        validateProjectMembership(userId, request.getProjectId());

        LocalDateTime checkInAt = now();
        // Staff must have a concrete assignment for the current project/date.
        // ADMIN/PM can perform an operational override, but the record will
        // remain visibly unscheduled instead of pretending to be a planned ca.
        ShiftAssignment shiftAssignment = isManager()
                ? shiftService.findApplicableAssignment(userId, request.getProjectId(), checkInAt).orElse(null)
                : shiftService.requireCheckInAssignment(userId, request.getProjectId(), checkInAt);

        User user = findUserOrThrow(userId);
        Project project = findProjectOrThrow(request.getProjectId());

        // Validate geofencing on the server. The browser check is only a UX hint.
        float distance = (float) validateGeofencing(
                project,
                request.getLatitude().doubleValue(),
                request.getLongitude().doubleValue());

        // Prevent duplicate check-in (active session)
        attendanceLogRepository
                .findActiveForUpdate(userId, request.getProjectId())
                .ifPresent(log -> {
                    throw new BadRequestException("Bạn đang có một ca làm việc chưa kết thúc. Vui lòng kết thúc ca hiện tại trước.");
                });

        // A split workday can have more than one completed session. Prevent
        // reusing the same assignment while allowing a later assignment (for
        // example, morning followed by afternoon) to be checked in normally.
        if (shiftAssignment != null && attendanceLogRepository.existsByShiftAssignmentAndStatusIn(
                shiftAssignment.getId(), COMPLETED_STATUSES)) {
            throw new BadRequestException("Ca này đã được chấm công hoàn tất, không thể chấm lại.");
        }

        // Upload selfie if provided
        String selfieUrl = null;
        if (selfie != null && !selfie.isEmpty()) {
            selfieUrl = storageService.uploadFile(selfie, "attendance");
        }

        AttendanceLog attendanceLog = AttendanceLog.builder()
                .user(user)
                .project(project)
                .shiftAssignment(shiftAssignment)
                .checkInAt(checkInAt)
                .gpsLatIn(request.getLatitude())
                .gpsLongIn(request.getLongitude())
                .distanceInMeters(distance)
                .gpsAccuracyIn(request.getAccuracy().doubleValue())
                .selfieUrlIn(selfieUrl)
                .status("CHECKED_IN")
                .overtimeMinutes(0L)
                .overtimeStatus(OVERTIME_NONE)
                .overtimeApprovedMinutes(0L)
                .build();

        if (shiftAssignment != null) {
            attendanceLog.setScheduledStartAt(shiftService.scheduledStartAt(shiftAssignment));
            attendanceLog.setScheduledEndAt(shiftService.scheduledEndAt(shiftAssignment));
            attendanceLog.setBreakMinutes(shiftAssignment.getShiftTemplate().getBreakMinutes());
            attendanceLog.setLateMinutes(shiftService.lateMinutes(shiftAssignment, checkInAt));
            attendanceLog.setEarlyLeaveMinutes(0L);
            attendanceLog.setOvertimeMinutes(0L);
        }

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

        validateCoordinates(request.getLatitude(), request.getLongitude(), request.getAccuracy());
        validateUserPermission(userId);
        validateProjectMembership(userId, projectId);

        Project project = findProjectOrThrow(projectId);

        // Find active check-in session
        AttendanceLog activeLog = attendanceLogRepository
                .findActiveForUpdate(userId, projectId)
                .orElseThrow(() -> new BadRequestException("Bạn chưa bắt đầu ca làm việc. Vui lòng chấm công vào ca trước."));

        LocalDateTime checkOutAt = now();
        if (activeLog.getCheckInAt() == null || !checkOutAt.isAfter(activeLog.getCheckInAt())) {
            throw new BadRequestException("Thời điểm tan ca phải sau thời điểm vào ca.");
        }
        if (Duration.between(activeLog.getCheckInAt(), checkOutAt).compareTo(MAX_ATTENDANCE_SESSION) > 0) {
            throw new BadRequestException("Ca làm việc vượt quá 24 giờ và cần được quản lý kiểm tra.");
        }

        float distanceOut = (float) validateGeofencing(
                project,
                request.getLatitude().doubleValue(),
                request.getLongitude().doubleValue());

        // Upload selfie if provided
        String selfieUrl = null;
        if (selfie != null && !selfie.isEmpty()) {
            selfieUrl = storageService.uploadFile(selfie, "attendance");
        }

        // Update check-out info
        activeLog.setCheckOutAt(checkOutAt);
        activeLog.setGpsLatOut(request.getLatitude());
        activeLog.setGpsLongOut(request.getLongitude());
        activeLog.setDistanceOutMeters(distanceOut);
        activeLog.setGpsAccuracyOut(request.getAccuracy().doubleValue());
        activeLog.setSelfieUrlOut(selfieUrl);
        activeLog.setStatus("COMPLETED");

        if (activeLog.getShiftAssignment() != null) {
            activeLog.setEarlyLeaveMinutes(shiftService.earlyLeaveMinutes(activeLog.getShiftAssignment(), checkOutAt));
            long overtimeMinutes = shiftService.overtimeMinutes(activeLog.getShiftAssignment(), checkOutAt);
            if (overtimeMinutes > 0 && !qualifiesForAdministrativeOvertime(activeLog, checkOutAt)) {
                overtimeMinutes = 0;
            }
            activeLog.setOvertimeMinutes(overtimeMinutes);
            activeLog.setOvertimeStatus(overtimeMinutes > 0 ? OVERTIME_PENDING : OVERTIME_NONE);
            activeLog.setOvertimeApprovedMinutes(0L);
        } else {
            // Unscheduled manager overrides never create an unreviewable
            // overtime amount because there is no scheduled end to compare.
            activeLog.setOvertimeMinutes(0L);
            activeLog.setOvertimeStatus(OVERTIME_NONE);
            activeLog.setOvertimeApprovedMinutes(0L);
        }

        AttendanceLog updated = attendanceLogRepository.save(activeLog);
        log.info("Check-out successful: userId={}, projectId={}", userId, projectId);

        return attendanceMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public AttendanceResponseDTO reviewOvertime(Long attendanceId, OvertimeReviewRequestDTO request) {
        if (!isManager()) {
            throw new AccessDeniedException("Chỉ quản trị viên hoặc quản lý dự án được duyệt tăng ca.");
        }

        AttendanceLog attendanceLog = attendanceLogRepository.findById(attendanceId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy lượt chấm công cần duyệt tăng ca."));
        if (attendanceLog.getProject() == null || attendanceLog.getProject().getId() == null) {
            throw new BadRequestException("Lượt chấm công chưa gắn với dự án hợp lệ.");
        }
        validateProjectAccess(attendanceLog.getProject().getId());

        long calculatedMinutes = attendanceLog.getOvertimeMinutes() == null
                ? 0L : attendanceLog.getOvertimeMinutes();
        if (!"COMPLETED".equals(attendanceLog.getStatus()) || attendanceLog.getCheckOutAt() == null) {
            throw new BadRequestException("Chỉ lượt chấm công đã checkout mới được duyệt tăng ca.");
        }
        if (calculatedMinutes <= 0 || OVERTIME_NONE.equalsIgnoreCase(attendanceLog.getOvertimeStatus())) {
            throw new BadRequestException("Lượt chấm công này không có phút tăng ca cần duyệt.");
        }
        if (!OVERTIME_PENDING.equalsIgnoreCase(attendanceLog.getOvertimeStatus())) {
            throw new BadRequestException("Lượt tăng ca này đã được xử lý trước đó, không thể duyệt lại.");
        }

        String reviewStatus = request.getStatus().trim().toUpperCase();
        long approvedMinutes = request.getApprovedMinutes();
        if (OVERTIME_APPROVED.equals(reviewStatus)) {
            if (approvedMinutes <= 0) {
                throw new BadRequestException("Số phút được duyệt phải lớn hơn 0. Nếu không chấp nhận tăng ca, hãy chọn từ chối và ghi rõ lý do.");
            }
            if (approvedMinutes > calculatedMinutes) {
                throw new BadRequestException("Số phút được duyệt không được lớn hơn " + calculatedMinutes + " phút đã tính.");
            }
        } else if (OVERTIME_REJECTED.equals(reviewStatus)) {
            if (request.getNote() == null || request.getNote().isBlank()) {
                throw new BadRequestException("Khi từ chối tăng ca cần ghi rõ lý do.");
            }
            approvedMinutes = 0L;
        } else {
            throw new BadRequestException("Trạng thái duyệt tăng ca không hợp lệ.");
        }

        User reviewer = currentUser();
        attendanceLog.setOvertimeStatus(reviewStatus);
        attendanceLog.setOvertimeApprovedMinutes(approvedMinutes);
        attendanceLog.setOvertimeReviewedBy(reviewer.getUsername());
        attendanceLog.setOvertimeReviewedAt(now());
        attendanceLog.setOvertimeReviewNote(trimToNull(request.getNote()));

        AttendanceLog saved = attendanceLogRepository.save(attendanceLog);
        log.info("Overtime reviewed: attendanceId={}, status={}, calculatedMinutes={}, approvedMinutes={}, reviewer={}",
                attendanceId, reviewStatus, calculatedMinutes, approvedMinutes, reviewer.getUsername());
        return attendanceMapper.toResponseDTO(saved);
    }

    @Override
    public List<AttendanceResponseDTO> getPersonalHistory(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Personal history: userId={}, {} to {}", userId, startDate, endDate);

        validateUserPermission(userId);

        validateDateRange(startDate, endDate);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<AttendanceLog> logs = attendanceLogRepository
                .findByUserIdAndCheckInAtBetweenOrderByCheckInAtDesc(userId, start, end);

        return attendanceMapper.toResponseDTOList(logs);
    }

    @Override
    public List<AttendanceResponseDTO> getProjectHistory(Integer projectId, LocalDate startDate, LocalDate endDate) {
        log.info("Project history: projectId={}, {} to {}", projectId, startDate, endDate);

        validateProjectAccess(projectId);
        validateDateRange(startDate, endDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<AttendanceLog> logs = attendanceLogRepository
                .findByProjectIdAndCheckInAtBetweenOrderByCheckInAtDesc(projectId, start, end);

        return attendanceMapper.toResponseDTOList(logs);
    }

    @Override
    public AttendanceResponseDTO getTodayRecord(Long userId, Integer projectId) {
        validateUserPermission(userId);
        // The project selector is only a UX aid. Enforce the same assignment
        // rule on this read endpoint so a user cannot query another project's
        // attendance record by changing the URL parameters manually.
        validateProjectMembership(userId, projectId);
        
        // 1. Check for active session first
        Optional<AttendanceLog> active = attendanceLogRepository
                .findActiveForUserAndProject(userId, projectId);
        if (active.isPresent()) {
            return attendanceMapper.toResponseDTO(active.get());
        }

        // If another uncompleted assignment is still available today, return
        // null so the UI can start that next shift instead of treating the
        // completed morning shift as the end of the whole workday.
        LocalDate businessDate = businessDate();
        if (shiftService.getCurrentAssignment(userId, projectId, businessDate) != null) {
            return null;
        }

        // Otherwise return the latest completed record today. FAILED attempts
        // are audit records and must not make the UI think the user is in a
        // live shift because their check_out_at is intentionally null.
        LocalDateTime startOfDay = businessDate.atStartOfDay();
        LocalDateTime endOfDay = businessDate.atTime(LocalTime.MAX);
        return attendanceLogRepository
                .findByUserIdAndProjectIdAndStatusAndCheckInAtBetweenOrderByCheckInAtDesc(
                        userId, projectId, "COMPLETED", startOfDay, endOfDay)
                .stream()
                .findFirst()
                .map(attendanceMapper::toResponseDTO)
                .orElse(null);
    }

    @Override
    public List<AttendanceResponseDTO> getAllLogs(LocalDate startDate, LocalDate endDate) {
        log.info("Global history: {} to {}", startDate, endDate);
        validateDateRange(startDate, endDate);
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        List<AttendanceLog> logs = attendanceLogRepository.findByCheckInAtBetweenOrderByCheckInAtDesc(start, end);
        return attendanceMapper.toResponseDTOList(logs);
    }

    @Override
    @Transactional
    public void logFailure(LogFailureRequestDTO request) {
        log.info("Log failure: userId={}, projectId={}, reason={}", request.getUserId(), request.getProjectId(), request.getReason());

        // Never allow a regular user to create a failure record for another account.
        validateUserPermission(request.getUserId());
        validateOptionalCoordinates(request.getLatitude(), request.getLongitude(), request.getAccuracy());

        User user = findUserOrThrow(request.getUserId());
        Project project = findProjectOrThrow(request.getProjectId());
        validateProjectMembership(request.getUserId(), request.getProjectId());

        AttendanceLog failLog = AttendanceLog.builder()
                .user(user)
                .project(project)
                .checkInAt(now())
                .gpsLatIn(request.getLatitude())
                .gpsLongIn(request.getLongitude())
                .gpsAccuracyIn(request.getAccuracy() != null ? request.getAccuracy().doubleValue() : null)
                .status("FAILED")
                .remarks(request.getReason())
                .build();

        attendanceLogRepository.save(failLog);
    }

    // ===== HELPERS =====

    private double validateGeofencing(Project project, double userLat, double userLon) {
        if (project.getLatitude() == null || project.getLongitude() == null) {
            throw new BadRequestException("Dự án chưa cấu hình tọa độ GPS nên không thể chấm công.");
        }
        if (project.getRadiusMeters() == null || project.getRadiusMeters() <= 0) {
            throw new BadRequestException("Dự án chưa cấu hình bán kính chấm công hợp lệ.");
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
            throw new BadRequestException(String.format(
                    "Bạn đang cách công trình %.0f mét, vượt bán kính cho phép %d mét.",
                    distance, project.getRadiusMeters()));
        }
        return GeoUtils.calculateDistance(
                project.getLatitude().doubleValue(),
                project.getLongitude().doubleValue(),
                userLat,
                userLon);
    }

    private void validateCoordinates(BigDecimal latitude, BigDecimal longitude, BigDecimal accuracy) {
        if (latitude == null || longitude == null || accuracy == null) {
            throw new BadRequestException("GPS và độ chính xác vị trí là bắt buộc.");
        }
        if (latitude.compareTo(BigDecimal.valueOf(-90)) < 0 || latitude.compareTo(BigDecimal.valueOf(90)) > 0) {
            throw new BadRequestException("Vĩ độ GPS không hợp lệ.");
        }
        if (longitude.compareTo(BigDecimal.valueOf(-180)) < 0 || longitude.compareTo(BigDecimal.valueOf(180)) > 0) {
            throw new BadRequestException("Kinh độ GPS không hợp lệ.");
        }
        if (accuracy.compareTo(BigDecimal.ZERO) < 0
                || accuracy.compareTo(BigDecimal.valueOf(MAX_GPS_ACCURACY_METERS)) > 0) {
            throw new BadRequestException(String.format(
                    "Độ chính xác GPS phải từ 0 đến %.0f mét. Vui lòng cập nhật vị trí rồi thử lại.",
                    MAX_GPS_ACCURACY_METERS));
        }
    }

    private void validateOptionalCoordinates(BigDecimal latitude, BigDecimal longitude, BigDecimal accuracy) {
        if ((latitude == null) != (longitude == null)) {
            throw new BadRequestException("Vĩ độ và kinh độ phải được gửi cùng nhau.");
        }
        if (latitude != null) {
            if (latitude.compareTo(BigDecimal.valueOf(-90)) < 0 || latitude.compareTo(BigDecimal.valueOf(90)) > 0
                    || longitude.compareTo(BigDecimal.valueOf(-180)) < 0 || longitude.compareTo(BigDecimal.valueOf(180)) > 0) {
                throw new BadRequestException("Tọa độ GPS không hợp lệ.");
            }
        }
        if (accuracy != null && (accuracy.compareTo(BigDecimal.ZERO) < 0
                || accuracy.compareTo(BigDecimal.valueOf(10000)) > 0)) {
            throw new BadRequestException("Độ chính xác GPS không hợp lệ.");
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            throw new BadRequestException("Khoảng thời gian không hợp lệ.");
        }
    }

    private LocalDateTime now() {
        return LocalDateTime.now(BUSINESS_ZONE);
    }

    private LocalDate businessDate() {
        return LocalDate.now(BUSINESS_ZONE);
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    private Project findProjectOrThrow(Integer projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy dự án được chọn."));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác này.");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Không xác định được tài khoản hiện tại."));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    /**
     * Overtime is only valid after a complete administrative workday. The
     * normal schedule is represented by two assignments (08:00-12:00 and
     * 13:00-17:30), while a legacy full-day assignment (08:00-17:30) is also
     * accepted for historical data. A night shift or a single half-day can
     * never create an overtime request.
     */
    private boolean qualifiesForAdministrativeOvertime(AttendanceLog currentLog, LocalDateTime actualCheckOut) {
        ShiftAssignment currentAssignment = currentLog.getShiftAssignment();
        if (currentAssignment == null || currentAssignment.getShiftTemplate() == null
                || currentAssignment.getWorkDate() == null) {
            return false;
        }

        ShiftTemplate currentTemplate = currentAssignment.getShiftTemplate();
        if (isFullDayAdministrativeShift(currentTemplate)) {
            return isFullShift(currentLog, actualCheckOut);
        }
        if (!isAfternoonAdministrativeShift(currentTemplate)
                || !isFullShift(currentLog, actualCheckOut)) {
            return false;
        }

        List<AttendanceLog> sameDayCompletedLogs = attendanceLogRepository
                .findByUserProjectAndShiftDateAndStatusIn(
                        currentLog.getUser().getId(),
                        currentLog.getProject().getId(),
                        currentAssignment.getWorkDate(),
                        COMPLETED_STATUSES);

        return sameDayCompletedLogs.stream()
                .filter(log -> log != currentLog)
                .filter(log -> log.getShiftAssignment() != null
                        && log.getShiftAssignment().getShiftTemplate() != null)
                .filter(log -> isMorningAdministrativeShift(log.getShiftAssignment().getShiftTemplate()))
                .anyMatch(log -> isFullShift(log, log.getCheckOutAt()));
    }

    private boolean isFullShift(AttendanceLog log, LocalDateTime actualCheckOut) {
        if (log == null || log.getCheckInAt() == null || actualCheckOut == null) {
            return false;
        }
        LocalDateTime scheduledStart = log.getScheduledStartAt();
        LocalDateTime scheduledEnd = log.getScheduledEndAt();
        if (scheduledStart == null && log.getShiftAssignment() != null) {
            scheduledStart = shiftService.scheduledStartAt(log.getShiftAssignment());
        }
        if (scheduledEnd == null && log.getShiftAssignment() != null) {
            scheduledEnd = shiftService.scheduledEndAt(log.getShiftAssignment());
        }
        return scheduledStart != null && scheduledEnd != null
                && !log.getCheckInAt().isAfter(scheduledStart)
                && !actualCheckOut.isBefore(scheduledEnd);
    }

    private boolean isMorningAdministrativeShift(ShiftTemplate template) {
        return template != null && !template.isCrossesMidnight()
                && LocalTime.of(8, 0).equals(template.getStartTime())
                && LocalTime.NOON.equals(template.getEndTime());
    }

    private boolean isAfternoonAdministrativeShift(ShiftTemplate template) {
        return template != null && !template.isCrossesMidnight()
                && LocalTime.of(13, 0).equals(template.getStartTime())
                && LocalTime.of(17, 30).equals(template.getEndTime());
    }

    private boolean isFullDayAdministrativeShift(ShiftTemplate template) {
        return template != null && !template.isCrossesMidnight()
                && LocalTime.of(8, 0).equals(template.getStartTime())
                && LocalTime.of(17, 30).equals(template.getEndTime());
    }

    // ===== SECURITY HELPERS =====

    private void validateUserPermission(Long requestedUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác chấm công.");
        }

        // Admin and Global PM can act on behalf of anyone
        boolean isManager = isManager();
        
        if (isManager) return;

        // Otherwise, requestedUserId must match the authenticated user
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Không xác định được tài khoản hiện tại."));
        
        if (!Objects.equals(currentUser.getId(), requestedUserId)) {
            throw new AccessDeniedException("Bạn chỉ được quản lý dữ liệu chấm công của chính mình.");
        }
    }

    private boolean isManager() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PM"));
    }

    private void validateProjectMembership(Long userId, Integer projectId) {
        if (isManager()) return;

        boolean isMember = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .map(member -> member.isActive())
                .orElse(false);
        if (!isMember) {
            throw new AccessDeniedException(
                    "Bạn chưa được phân công vào dự án này nên không thể chấm công.");
        }
    }

    private void validateProjectAccess(Integer projectId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để xem lịch sử chấm công.");
        }

        // Admin and Global PM can view any project
        boolean isManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PM"));
        if (isManager) return;

        // Staff must be a member of the project AND have PM/SUPERVISOR role in that project to view history
        User currentUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Không xác định được tài khoản hiện tại."));
        
        projectMemberRepository.findByProjectIdAndUserId(projectId, currentUser.getId())
                .filter(member -> member.isActive())
                .ifPresentOrElse(member -> {
                    String role = member.getAssignedRole();
                    if (role == null || !List.of("PM", "SUPERVISOR", "ENGINEER").contains(role)) {
                        throw new AccessDeniedException("Bạn không có quyền xem lịch sử chấm công của dự án này.");
                    }
                }, () -> {
                    throw new AccessDeniedException("Bạn chưa được phân công vào dự án này.");
                });
    }
}
