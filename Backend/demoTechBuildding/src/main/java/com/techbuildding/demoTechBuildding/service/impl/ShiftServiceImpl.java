package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftAssignmentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.shift.FullDayShiftAssignmentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftTemplateRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.shift.ShiftAssignmentResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.shift.ShiftTemplateResponseDTO;
import com.techbuildding.demoTechBuildding.entity.AttendanceLog;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.ProjectMember;
import com.techbuildding.demoTechBuildding.entity.ShiftAssignment;
import com.techbuildding.demoTechBuildding.entity.ShiftTemplate;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.exception.DuplicateResourceException;
import com.techbuildding.demoTechBuildding.repository.ProjectMemberRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.AttendanceLogRepository;
import com.techbuildding.demoTechBuildding.repository.ShiftAssignmentRepository;
import com.techbuildding.demoTechBuildding.repository.ShiftTemplateRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.NotificationService;
import com.techbuildding.demoTechBuildding.service.ShiftService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Set<String> ACTIVE_STATUSES = Set.of("ASSIGNED");
    // A completed check-in or an absence consumes the assigned shift unless an
    // admin explicitly reopens an automatic missed-check-in absence.
    private static final Set<String> ATTENDANCE_CLAIM_STATUSES = Set.of("CHECKED_IN", "COMPLETED", "ABSENT");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final Pattern CODE_PATTERN = Pattern.compile("[A-Z0-9][A-Z0-9_-]{1,49}");
    private static final LocalTime ADMIN_MORNING_START = LocalTime.of(8, 0);
    private static final LocalTime ADMIN_AFTERNOON_START = LocalTime.of(13, 0);
    private static final LocalTime ADMIN_DAY_END = LocalTime.of(17, 30);
    private static final long MIN_OVERTIME_MINUTES = 60L;
    private static final long MAX_OVERTIME_MINUTES = 210L;
    private static final long MAX_LATE_CHECK_IN_MINUTES = 30L;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String LATE_ABSENCE_REMARK =
            "Tự động chốt vắng: quá 30 phút kể từ giờ bắt đầu ca nhưng chưa check-in.";

    private final ShiftTemplateRepository shiftTemplateRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<ShiftTemplateResponseDTO> getTemplates(Integer projectId) {
        List<ShiftTemplate> templates = projectId == null
                ? shiftTemplateRepository.findByStatusOrderByStartTimeAsc("ACTIVE")
                : shiftTemplateRepository.findByProjectIdIsNullOrProjectIdOrderByStartTimeAsc(projectId).stream()
                        .filter(template -> "ACTIVE".equals(template.getStatus()))
                        .toList();
        return templates.stream().map(this::toTemplateResponse).toList();
    }

    @Override
    @Transactional
    public ShiftTemplateResponseDTO createTemplate(ShiftTemplateRequestDTO request) {
        requireManager();
        String code = request.getCode() == null ? "" : request.getCode().trim().toUpperCase();
        if (!CODE_PATTERN.matcher(code).matches()) {
            throw new BadRequestException("Mã ca chỉ gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.");
        }
        if (shiftTemplateRepository.findByCode(code).isPresent()) {
            throw new DuplicateResourceException("Mã ca đã tồn tại.");
        }
        validateTemplateTimes(request.getStartTime(), request.getEndTime(), request.isCrossesMidnight());
        int breakMinutes = defaultZero(request.getBreakMinutes());
        int earlyCheckInMinutes = defaultValue(request.getEarlyCheckInMinutes(), 30);
        int lateCheckInMinutes = (int) Math.min(
                defaultValue(request.getLateCheckInMinutes(), (int) MAX_LATE_CHECK_IN_MINUTES),
                MAX_LATE_CHECK_IN_MINUTES);
        validateTemplateDurations(request.getStartTime(), request.getEndTime(), request.isCrossesMidnight(), breakMinutes,
                earlyCheckInMinutes, lateCheckInMinutes);

        Project project = null;
        if (request.getProjectId() != null) {
            project = findProject(request.getProjectId());
        }

        boolean policyAllowsOvertime = isAdministrativeOvertimeShift(request.getStartTime(), request.getEndTime(),
                request.isCrossesMidnight());
        ShiftTemplate template = ShiftTemplate.builder()
                .project(project)
                .code(code)
                .name(request.getName().trim())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .crossesMidnight(request.isCrossesMidnight())
                .breakMinutes(breakMinutes)
                .earlyCheckInMinutes(earlyCheckInMinutes)
                .lateCheckInMinutes(lateCheckInMinutes)
                // A request cannot opt a night or an arbitrary single shift
                // into overtime. The business rule is deliberately enforced
                // server-side from the administrative shift time window.
                .overtimeEligible(request.isOvertimeEligible() && policyAllowsOvertime)
                .status("ACTIVE")
                .build();
        return toTemplateResponse(shiftTemplateRepository.save(template));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShiftAssignmentResponseDTO> getAssignments(LocalDate from, LocalDate to, Integer projectId, Long userId) {
        validateDateRange(from, to);
        if (from.plusDays(93).isBefore(to)) {
            throw new BadRequestException("Khoảng xem lịch phân ca không được vượt quá 93 ngày.");
        }

        boolean manager = isManager();
        Long effectiveUserId = userId;
        if (!manager) {
            effectiveUserId = currentUser().getId();
            if (projectId != null) {
                requireActiveMember(projectId, effectiveUserId);
            }
        }

        List<ShiftAssignment> assignments;
        if (effectiveUserId != null && projectId != null) {
            assignments = shiftAssignmentRepository
                    .findByUserIdAndProjectIdAndWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                            effectiveUserId, projectId, from, to, ACTIVE_STATUSES);
        } else if (effectiveUserId != null) {
            assignments = shiftAssignmentRepository
                    .findByUserIdAndWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                            effectiveUserId, from, to, ACTIVE_STATUSES);
        } else if (projectId != null) {
            assignments = shiftAssignmentRepository
                    .findByProjectIdAndWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                            projectId, from, to, ACTIVE_STATUSES);
        } else {
            assignments = shiftAssignmentRepository
                    .findByWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                            from, to, ACTIVE_STATUSES);
        }
        LocalDateTime currentTime = LocalDateTime.now(BUSINESS_ZONE);
        return assignments.stream().map(assignment -> toAssignmentResponse(assignment, currentTime)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ShiftAssignmentResponseDTO getCurrentAssignment(Long userId, Integer projectId, LocalDate date) {
        validateUserScope(userId);
        requireActiveMemberIfStaff(projectId, userId);
        LocalDate effectiveDate = date == null ? LocalDate.now(BUSINESS_ZONE) : date;
        LocalDateTime currentTime = LocalDateTime.now(BUSINESS_ZONE);
        // Display data must remain available after a shift has been consumed
        // by COMPLETED/ABSENT. Check-in eligibility is filtered separately by
        // findCandidates(), so the UI never confuses an old shift with no shift.
        List<ShiftAssignment> candidates = findDisplayCandidates(userId, projectId, effectiveDate);
        if (candidates.isEmpty()) {
            return null;
        }

        // Keep an open check-in as the primary context. Otherwise prefer an
        // unconsumed assignment (for example, afternoon after a completed
        // morning shift). Only when every assignment has been consumed do we
        // show the latest ABSENT/COMPLETED assignment as history context.
        List<ShiftAssignment> openCandidates = candidates.stream()
                .filter(this::hasOpenAttendanceClaim)
                .toList();
        if (!openCandidates.isEmpty()) {
            candidates = openCandidates;
        } else {
            List<ShiftAssignment> unclaimedCandidates = candidates.stream()
                    .filter(assignment -> !hasAttendanceClaim(assignment))
                    .toList();
            if (!unclaimedCandidates.isEmpty()) {
                candidates = unclaimedCandidates;
            }
        }

        ShiftAssignment selected = selectBestCandidate(candidates, currentTime, effectiveDate);
        return toAssignmentResponse(selected, currentTime);
    }

    @Override
    @Transactional
    public ShiftAssignmentResponseDTO createAssignment(ShiftAssignmentRequestDTO request) {
        requireManager();
        Project project = findProject(request.getProjectId());
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy nhân viên được phân ca."));
        ProjectMember member = requireActiveMember(request.getProjectId(), request.getUserId());
        if (!member.isActive()) {
            throw new BadRequestException("Nhân viên không còn hoạt động trong dự án này.");
        }
        ShiftTemplate template = shiftTemplateRepository.findById(request.getShiftTemplateId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy mẫu ca."));
        if (!"ACTIVE".equals(template.getStatus())) {
            throw new BadRequestException("Mẫu ca đã ngừng sử dụng.");
        }
        if (template.getProject() != null && !template.getProject().getId().equals(project.getId())) {
            throw new BadRequestException("Mẫu ca không thuộc dự án được chọn.");
        }
        if (request.getWorkDate().isBefore(LocalDate.now(BUSINESS_ZONE).minusDays(1))) {
            throw new BadRequestException("Không thể phân ca cho ngày đã quá hạn.");
        }
        if (shiftAssignmentRepository.findByProjectIdAndUserIdAndShiftTemplateIdAndWorkDate(
                request.getProjectId(), request.getUserId(), request.getShiftTemplateId(), request.getWorkDate()).isPresent()) {
            throw new DuplicateResourceException("Nhân viên đã được phân ca này trong ngày đã chọn.");
        }

        List<ShiftAssignment> nearbyAssignments = shiftAssignmentRepository
                .findByUserIdAndProjectIdAndWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                        request.getUserId(), request.getProjectId(), request.getWorkDate().minusDays(1),
                        request.getWorkDate().plusDays(1), ACTIVE_STATUSES);
        boolean overlaps = nearbyAssignments.stream()
                .anyMatch(existing -> overlaps(existing, template, request.getWorkDate()));
        if (overlaps) {
            throw new DuplicateResourceException("Ca mới bị trùng khung giờ với một ca đã phân cho nhân viên trong dự án.");
        }

        ShiftAssignment assignment = ShiftAssignment.builder()
                .shiftTemplate(template)
                .project(project)
                .user(user)
                .workDate(request.getWorkDate())
                .status("ASSIGNED")
                .notes(trimToNull(request.getNotes()))
                .build();
        ShiftAssignment saved = shiftAssignmentRepository.save(assignment);
        log.info("Shift assigned: assignmentId={}, userId={}, projectId={}, workDate={}, shift={}",
                saved.getId(), user.getId(), project.getId(), saved.getWorkDate(), template.getCode());
        notifyShiftAssigned(saved);
        return toAssignmentResponse(saved, LocalDateTime.now(BUSINESS_ZONE));
    }

    @Override
    @Transactional
    public ShiftAssignmentResponseDTO createFullDayAssignment(FullDayShiftAssignmentRequestDTO request) {
        requireManager();
        Project project = findProject(request.getProjectId());
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy nhân viên được phân ca."));
        requireActiveMember(request.getProjectId(), request.getUserId());

        ShiftTemplate fullDayTemplate = shiftTemplateRepository.findById(request.getShiftTemplateId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy mẫu Full ca."));
        validateTemplateForProject(fullDayTemplate, project, "Mẫu Full ca");
        if (!isFullDayAdministrativeShift(fullDayTemplate)) {
            throw new BadRequestException("Mẫu Full ca phải có khung giờ liên tục 08:00–17:30.");
        }
        if (!fullDayTemplate.isOvertimeEligible()) {
            throw new BadRequestException("Mẫu Full ca phải bật tính tăng ca sau 17:30.");
        }
        if (request.getWorkDate().isBefore(LocalDate.now(BUSINESS_ZONE).minusDays(1))) {
            throw new BadRequestException("Không thể phân ca cho ngày đã quá hạn.");
        }

        List<ShiftAssignment> nearbyAssignments = shiftAssignmentRepository
                .findByUserIdAndProjectIdAndWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                        request.getUserId(), request.getProjectId(), request.getWorkDate().minusDays(1),
                        request.getWorkDate().plusDays(1), ACTIVE_STATUSES);
        if (shiftAssignmentRepository.findByProjectIdAndUserIdAndShiftTemplateIdAndWorkDate(
                request.getProjectId(), request.getUserId(), fullDayTemplate.getId(), request.getWorkDate()).isPresent()) {
            throw new DuplicateResourceException("Nhân viên đã được phân Full ca trong ngày đã chọn.");
        }
        if (nearbyAssignments.stream().anyMatch(existing -> overlaps(existing, fullDayTemplate, request.getWorkDate()))) {
            throw new DuplicateResourceException(
                    "Full ca bị trùng khung giờ với một ca đã phân cho nhân viên trong dự án.");
        }

        ShiftAssignment assignment = ShiftAssignment.builder()
                .shiftTemplate(fullDayTemplate)
                .project(project)
                .user(user)
                .workDate(request.getWorkDate())
                .status("ASSIGNED")
                .notes(fullDayNote(trimToNull(request.getNotes())))
                .build();

        // Full ca is one continuous assignment. Break time is a calculation
        // detail; it never creates a second checkout or a second absence row.
        ShiftAssignment saved = shiftAssignmentRepository.save(assignment);
        log.info("Full-day shift assigned: assignmentId={}, userId={}, projectId={}, workDate={}, template={}",
                saved.getId(), user.getId(), project.getId(), request.getWorkDate(), fullDayTemplate.getCode());
        notifyFullDayAssigned(user, project, request.getWorkDate(), fullDayTemplate);
        return toAssignmentResponse(saved, LocalDateTime.now(BUSINESS_ZONE));
    }

    @Override
    @Transactional
    public ShiftAssignmentResponseDTO approveLateCheckIn(Long assignmentId, String reason) {
        requireManager();
        ShiftAssignment assignment = findAssignment(assignmentId);
        if ("CANCELLED".equals(assignment.getStatus())) {
            throw new BadRequestException("Không thể mở quyền chấm công cho ca đã hủy.");
        }
        if (trimToNull(reason) == null) {
            throw new BadRequestException("Lý do cho phép chấm công muộn là bắt buộc.");
        }
        Optional<AttendanceLog> latestAttendance = attendanceLogRepository
                .findFirstByShiftAssignmentIdOrderByCreatedAtDesc(assignmentId);
        if (latestAttendance.isPresent()) {
            AttendanceLog latest = latestAttendance.get();
            String latestStatus = latest.getStatus();
            if ("CHECKED_IN".equalsIgnoreCase(latestStatus)
                    || "COMPLETED".equalsIgnoreCase(latestStatus)) {
                throw new BadRequestException("Ca này đã có lượt chấm công và không thể mở lại.");
            }
            if ("ABSENT".equalsIgnoreCase(latestStatus) && !isAutomaticMissedCheckIn(latest)) {
                throw new BadRequestException(
                        "Ca đã bị chốt vắng do thiếu checkout hoặc điều chỉnh thủ công; không thể mở chấm công vào lại.");
            }
        }

        User approver = currentUser();
        assignment.setLateCheckInApproved(true);
        assignment.setLateCheckInApprovedBy(approver.getId());
        assignment.setLateCheckInApprovedAt(LocalDateTime.now(BUSINESS_ZONE));
        assignment.setLateCheckInApprovalNote(trimToNull(reason));
        ShiftAssignment saved = shiftAssignmentRepository.save(assignment);
        log.info("Late check-in approved: assignmentId={}, userId={}, approvedBy={}, reason={}",
                assignmentId, assignment.getUser().getId(), approver.getId(), trimToNull(reason));
        notifyLateCheckInApproved(saved);
        return toAssignmentResponse(saved, LocalDateTime.now(BUSINESS_ZONE));
    }

    @Override
    @Transactional
    public void revokeLateCheckIn(Long assignmentId) {
        requireManager();
        ShiftAssignment assignment = findAssignment(assignmentId);
        if (!assignment.isLateCheckInApproved()) {
            return;
        }
        if (hasBlockingAttendanceClaim(assignment)) {
            throw new BadRequestException("Không thể thu hồi sau khi nhân viên đã chấm công hoặc ca đã chốt vắng.");
        }
        assignment.setLateCheckInApproved(false);
        assignment.setLateCheckInApprovedBy(null);
        assignment.setLateCheckInApprovedAt(null);
        assignment.setLateCheckInApprovalNote(null);
        shiftAssignmentRepository.save(assignment);
        log.info("Late check-in approval revoked: assignmentId={}, userId={}",
                assignmentId, assignment.getUser().getId());
    }

    @Override
    @Transactional
    public void cancelAssignment(Long assignmentId) {
        requireManager();
        ShiftAssignment assignment = shiftAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy phân ca."));
        if ("CANCELLED".equals(assignment.getStatus())) {
            return;
        }
        assignment.setStatus("CANCELLED");
        shiftAssignmentRepository.save(assignment);
        notifyShiftCancelled(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public ShiftAssignment requireCheckInAssignment(Long userId, Integer projectId, LocalDateTime currentTime) {
        requireActiveMember(projectId, userId);
        List<ShiftAssignment> candidates = findCandidates(userId, projectId, currentTime.toLocalDate());
        Optional<ShiftAssignment> applicable = candidates.stream()
                .filter(assignment -> isWithinCheckInWindow(assignment, currentTime))
                .min(Comparator.comparing(assignment -> Math.abs(Duration.between(
                        scheduledStartAt(assignment), currentTime).toMinutes())));
        if (applicable.isPresent()) {
            return applicable.get();
        }

        if (candidates.isEmpty()) {
            throw new BadRequestException("Bạn chưa được phân công ca làm việc cho dự án này trong hôm nay.");
        }
        ShiftAssignment nearest = selectBestCandidate(candidates, currentTime, currentTime.toLocalDate());
        throw new BadRequestException(windowMessage(nearest, currentTime));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ShiftAssignment> findApplicableAssignment(Long userId, Integer projectId, LocalDateTime currentTime) {
        return findCandidates(userId, projectId, currentTime.toLocalDate()).stream()
                .filter(assignment -> isWithinCheckInWindow(assignment, currentTime))
                .min(Comparator.comparing(assignment -> Math.abs(Duration.between(
                        scheduledStartAt(assignment), currentTime).toMinutes())));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ShiftAssignment> findLateCheckInAssignment(Long userId, Integer projectId,
                                                               LocalDateTime currentTime) {
        if (currentTime == null) {
            return Optional.empty();
        }
        return findCandidates(userId, projectId, currentTime.toLocalDate()).stream()
                .filter(assignment -> !currentTime.isBefore(scheduledStartAt(assignment)))
                .filter(assignment -> isLateBeyondCheckInLimit(assignment, currentTime))
                .min(Comparator.comparing(assignment -> Math.abs(Duration.between(
                        scheduledStartAt(assignment), currentTime).toMinutes())));
    }

    @Override
    @Transactional
    public int finalizeMissedAssignments(LocalDateTime currentTime) {
        if (currentTime == null) {
            return 0;
        }

        LocalDate effectiveDate = currentTime.toLocalDate();
        List<ShiftAssignment> assignments = shiftAssignmentRepository
                .findByWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                        effectiveDate.minusDays(1), effectiveDate, ACTIVE_STATUSES);
        List<AttendanceLog> absences = new ArrayList<>();

        for (ShiftAssignment assignment : assignments) {
            if (assignment.isLateCheckInApproved()) {
                continue;
            }
            LocalDateTime scheduledStart = scheduledStartAt(assignment);
            if (!currentTime.isAfter(scheduledStart.plusMinutes(allowedLateCheckInMinutes(assignment)))) {
                continue;
            }
            if (attendanceLogRepository.existsByShiftAssignmentAndStatusIn(
                    assignment.getId(), ATTENDANCE_CLAIM_STATUSES)) {
                continue;
            }

            absences.add(AttendanceLog.builder()
                    .user(assignment.getUser())
                    .project(assignment.getProject())
                    .shiftAssignment(assignment)
                    // Keep the absence visible on the scheduled work date. The
                    // remark makes it explicit that this is not a real check-in.
                    .checkInAt(scheduledStart)
                    .scheduledStartAt(scheduledStart)
                    .scheduledEndAt(scheduledEndAt(assignment))
                    .breakMinutes(assignment.getShiftTemplate().getBreakMinutes())
                    .status("ABSENT")
                    .lateMinutes(null)
                    .earlyLeaveMinutes(null)
                    .overtimeMinutes(0L)
                    .overtimeStatus("NONE")
                    .overtimeApprovedMinutes(0L)
                    .remarks(LATE_ABSENCE_REMARK)
                    .build());
        }

        if (absences.isEmpty()) {
            return 0;
        }
        attendanceLogRepository.saveAll(absences);
        log.info("Auto-finalized missed shifts as absent: count={}, cutoff={}", absences.size(), currentTime);
        return absences.size();
    }

    @Override
    public LocalDateTime scheduledStartAt(ShiftAssignment assignment) {
        return LocalDateTime.of(assignment.getWorkDate(), assignment.getShiftTemplate().getStartTime());
    }

    @Override
    public LocalDateTime scheduledEndAt(ShiftAssignment assignment) {
        LocalDate date = assignment.getWorkDate();
        if (assignment.getShiftTemplate().isCrossesMidnight()) {
            date = date.plusDays(1);
        }
        return LocalDateTime.of(date, assignment.getShiftTemplate().getEndTime());
    }

    @Override
    public LocalDateTime missedCheckoutCutoffAt(ShiftAssignment assignment) {
        if (assignment == null) {
            return null;
        }
        LocalDateTime scheduledEnd = scheduledEndAt(assignment);
        ShiftTemplate template = assignment.getShiftTemplate();
        if (template != null && template.isOvertimeEligible()
                && isAdministrativeOvertimeShift(template.getStartTime(), template.getEndTime(),
                template.isCrossesMidnight())) {
            return scheduledEnd.plusMinutes(MAX_OVERTIME_MINUTES);
        }
        return scheduledEnd;
    }

    @Override
    public long lateMinutes(ShiftAssignment assignment, LocalDateTime actualCheckIn) {
        return Math.max(0, Duration.between(scheduledStartAt(assignment), actualCheckIn).toMinutes());
    }

    @Override
    public long allowedLateCheckInMinutes(ShiftAssignment assignment) {
        if (assignment == null || assignment.getShiftTemplate() == null
                || assignment.getShiftTemplate().getLateCheckInMinutes() == null) {
            return MAX_LATE_CHECK_IN_MINUTES;
        }
        return Math.max(0, Math.min(MAX_LATE_CHECK_IN_MINUTES,
                assignment.getShiftTemplate().getLateCheckInMinutes()));
    }

    @Override
    public boolean isLateBeyondCheckInLimit(ShiftAssignment assignment, LocalDateTime actualCheckIn) {
        return assignment != null && actualCheckIn != null
                && actualCheckIn.isAfter(
                scheduledStartAt(assignment).plusMinutes(allowedLateCheckInMinutes(assignment)));
    }

    @Override
    public long earlyLeaveMinutes(ShiftAssignment assignment, LocalDateTime actualCheckOut) {
        return Math.max(0, Duration.between(actualCheckOut, scheduledEndAt(assignment)).toMinutes());
    }

    @Override
    public long overtimeMinutes(ShiftAssignment assignment, LocalDateTime actualCheckOut) {
        if (assignment == null || assignment.getShiftTemplate() == null
                || !assignment.getShiftTemplate().isOvertimeEligible()
                || !isAdministrativeOvertimeShift(assignment.getShiftTemplate().getStartTime(),
                assignment.getShiftTemplate().getEndTime(),
                assignment.getShiftTemplate().isCrossesMidnight())) {
            return 0;
        }
        long rawMinutes = Math.max(0, Duration.between(scheduledEndAt(assignment), actualCheckOut).toMinutes());
        if (rawMinutes == 0) {
            return 0;
        }
        // Approved overtime is paid in a bounded window: any valid amount
        // after 17:30 has at least one hour, and never exceeds 3h30.
        return Math.min(MAX_OVERTIME_MINUTES, Math.max(MIN_OVERTIME_MINUTES, rawMinutes));
    }

    private boolean isAdministrativeOvertimeShift(LocalTime startTime, LocalTime endTime,
                                                   boolean crossesMidnight) {
        if (crossesMidnight || startTime == null || endTime == null || !ADMIN_DAY_END.equals(endTime)) {
            return false;
        }
        return ADMIN_AFTERNOON_START.equals(startTime) || ADMIN_MORNING_START.equals(startTime);
    }

    private List<ShiftAssignment> findCandidates(Long userId, Integer projectId, LocalDate effectiveDate) {
        return shiftAssignmentRepository
                .findByUserIdAndProjectIdAndWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                        userId, projectId, effectiveDate.minusDays(1), effectiveDate, ACTIVE_STATUSES)
                .stream()
                .filter(assignment -> assignment.getWorkDate().equals(effectiveDate)
                        || (assignment.getWorkDate().equals(effectiveDate.minusDays(1))
                        && assignment.getShiftTemplate().isCrossesMidnight()))
                .filter(assignment -> !hasBlockingAttendanceClaim(assignment))
                .toList();
    }

    private List<ShiftAssignment> findDisplayCandidates(Long userId, Integer projectId, LocalDate effectiveDate) {
        return shiftAssignmentRepository
                .findByUserIdAndProjectIdAndWorkDateBetweenAndStatusInOrderByWorkDateAscShiftTemplateStartTimeAsc(
                        userId, projectId, effectiveDate.minusDays(1), effectiveDate, ACTIVE_STATUSES)
                .stream()
                .filter(assignment -> assignment.getWorkDate().equals(effectiveDate)
                        || (assignment.getWorkDate().equals(effectiveDate.minusDays(1))
                        && assignment.getShiftTemplate().isCrossesMidnight()))
                .toList();
    }

    private boolean hasAttendanceClaim(ShiftAssignment assignment) {
        return hasBlockingAttendanceClaim(assignment);
    }

    private boolean hasBlockingAttendanceClaim(ShiftAssignment assignment) {
        return attendanceLogRepository.findFirstByShiftAssignmentIdOrderByCreatedAtDesc(assignment.getId())
                .map(log -> {
                    if ("ABSENT".equalsIgnoreCase(log.getStatus())
                            && assignment.isLateCheckInApproved()
                            && isAutomaticMissedCheckIn(log)) {
                        return false;
                    }
                    return ATTENDANCE_CLAIM_STATUSES.contains(log.getStatus());
                })
                .orElse(false);
    }

    private boolean isAutomaticMissedCheckIn(AttendanceLog attendanceLog) {
        return attendanceLog != null
                && "ABSENT".equalsIgnoreCase(attendanceLog.getStatus())
                // Migrations may append an audit suffix while preserving the
                // system-generated reason; it must still be reopenable by a
                // manager through the special check-in flow.
                && attendanceLog.getRemarks() != null
                && attendanceLog.getRemarks().startsWith(LATE_ABSENCE_REMARK);
    }

    private boolean hasOpenAttendanceClaim(ShiftAssignment assignment) {
        return attendanceLogRepository.findFirstByShiftAssignmentIdOrderByCreatedAtDesc(assignment.getId())
                .map(log -> "CHECKED_IN".equalsIgnoreCase(log.getStatus()) && log.getCheckOutAt() == null)
                .orElse(false);
    }

    private ShiftAssignment selectBestCandidate(List<ShiftAssignment> candidates, LocalDateTime currentTime, LocalDate effectiveDate) {
        return candidates.stream()
                .filter(candidate -> isWithinCheckInWindow(candidate, currentTime))
                .findFirst()
                .orElseGet(() -> candidates.stream()
                        .filter(candidate -> candidate.getWorkDate().equals(effectiveDate))
                        .min(Comparator.comparing(candidate -> Math.abs(Duration.between(
                                scheduledStartAt(candidate), currentTime).toMinutes())))
                        .orElse(candidates.get(candidates.size() - 1)));
    }

    private boolean isWithinCheckInWindow(ShiftAssignment assignment, LocalDateTime currentTime) {
        LocalDateTime start = scheduledStartAt(assignment).minusMinutes(assignment.getShiftTemplate().getEarlyCheckInMinutes());
        LocalDateTime end = scheduledStartAt(assignment).plusMinutes(allowedLateCheckInMinutes(assignment));
        if (!currentTime.isBefore(start) && !currentTime.isAfter(end)) {
            return true;
        }
        return assignment.isLateCheckInApproved()
                && currentTime.toLocalDate().equals(assignment.getWorkDate())
                && !currentTime.isBefore(scheduledStartAt(assignment));
    }

    private String windowMessage(ShiftAssignment assignment, LocalDateTime currentTime) {
        LocalDateTime start = scheduledStartAt(assignment);
        LocalDateTime end = scheduledEndAt(assignment);
        if (currentTime.isBefore(start.minusMinutes(assignment.getShiftTemplate().getEarlyCheckInMinutes()))) {
            return "Ca " + assignment.getShiftTemplate().getName() + " bắt đầu lúc " + start.format(TIME_FORMAT) + ". Vui lòng quay lại trong khung chấm công.";
        }
        if (currentTime.isAfter(start.plusMinutes(allowedLateCheckInMinutes(assignment)))) {
            if (assignment.isLateCheckInApproved()
                    && currentTime.toLocalDate().equals(assignment.getWorkDate())) {
                return "Quản lý đã cho phép chấm công muộn cho ca này. Bạn có thể bắt đầu ca ngay bây giờ.";
            }
            return "Bạn đã muộn quá " + allowedLateCheckInMinutes(assignment)
                    + " phút so với ca " + assignment.getShiftTemplate().getName()
                    + ". Ca này được ghi nhận vắng.";
        }
        return "Khung chấm công của ca " + assignment.getShiftTemplate().getName() + " đã kết thúc lúc "
                + end.format(TIME_FORMAT) + ".";
    }

    private ShiftTemplateResponseDTO toTemplateResponse(ShiftTemplate template) {
        ShiftTemplateResponseDTO response = new ShiftTemplateResponseDTO();
        response.setId(template.getId());
        response.setProjectId(template.getProject() == null ? null : template.getProject().getId());
        response.setProjectName(template.getProject() == null ? null : template.getProject().getName());
        response.setCode(template.getCode());
        response.setName(template.getName());
        response.setStartTime(template.getStartTime());
        response.setEndTime(template.getEndTime());
        response.setCrossesMidnight(template.isCrossesMidnight());
        response.setBreakMinutes(template.getBreakMinutes());
        response.setEarlyCheckInMinutes(template.getEarlyCheckInMinutes());
        response.setLateCheckInMinutes((int) Math.min(MAX_LATE_CHECK_IN_MINUTES,
                template.getLateCheckInMinutes() == null ? MAX_LATE_CHECK_IN_MINUTES : template.getLateCheckInMinutes()));
        response.setOvertimeEligible(template.isOvertimeEligible());
        response.setStatus(template.getStatus());
        return response;
    }

    private ShiftAssignmentResponseDTO toAssignmentResponse(ShiftAssignment assignment, LocalDateTime currentTime) {
        ShiftTemplate template = assignment.getShiftTemplate();
        ShiftAssignmentResponseDTO response = new ShiftAssignmentResponseDTO();
        response.setId(assignment.getId());
        response.setProjectId(assignment.getProject().getId());
        response.setProjectName(assignment.getProject().getName());
        response.setUserId(assignment.getUser().getId());
        response.setUsername(assignment.getUser().getUsername());
        response.setFullName(assignment.getUser().getFullName());
        response.setShiftTemplateId(template.getId());
        response.setShiftCode(template.getCode());
        response.setShiftName(template.getName());
        response.setStartTime(template.getStartTime());
        response.setEndTime(template.getEndTime());
        response.setCrossesMidnight(template.isCrossesMidnight());
        response.setBreakMinutes(template.getBreakMinutes());
        response.setEarlyCheckInMinutes(template.getEarlyCheckInMinutes());
        response.setLateCheckInMinutes((int) Math.min(MAX_LATE_CHECK_IN_MINUTES,
                template.getLateCheckInMinutes() == null ? MAX_LATE_CHECK_IN_MINUTES : template.getLateCheckInMinutes()));
        response.setOvertimeEligible(template.isOvertimeEligible());
        response.setWorkDate(assignment.getWorkDate());
        response.setScheduledStartAt(scheduledStartAt(assignment));
        response.setScheduledEndAt(scheduledEndAt(assignment));
        response.setStatus(assignment.getStatus());
        response.setNotes(assignment.getNotes());
        response.setLateCheckInApproved(assignment.isLateCheckInApproved());
        response.setLateCheckInApprovedAt(assignment.getLateCheckInApprovedAt());
        response.setLateCheckInApprovalNote(assignment.getLateCheckInApprovalNote());
        String attendanceStatus = attendanceLogRepository
                .findFirstByShiftAssignmentIdOrderByCreatedAtDesc(assignment.getId())
                .map(AttendanceLog::getStatus)
                .orElse(null);
        boolean attendanceClaimed = hasBlockingAttendanceClaim(assignment);
        boolean withinCheckInWindow = isWithinCheckInWindow(assignment, currentTime);
        response.setAttendanceStatus(attendanceStatus);
        response.setAttendanceClaimed(attendanceClaimed);
        response.setCurrent(withinCheckInWindow);
        response.setEligibleForCheckIn(withinCheckInWindow && !attendanceClaimed);
        response.setWindowMessage(assignmentWindowMessage(assignment, currentTime, attendanceStatus, attendanceClaimed));
        return response;
    }

    private String assignmentWindowMessage(ShiftAssignment assignment, LocalDateTime currentTime,
                                           String attendanceStatus, boolean attendanceClaimed) {
        if ("ABSENT".equalsIgnoreCase(attendanceStatus)
                && assignment.isLateCheckInApproved()
                && !attendanceClaimed) {
            return "Quản lý đã mở chấm công đặc thù cho ca này. Vui lòng xác thực GPS và khuôn mặt để bắt đầu.";
        }
        if ("ABSENT".equalsIgnoreCase(attendanceStatus)
                && assignment.isLateCheckInApproved()
                && attendanceClaimed) {
            return "Quyền chấm công đặc thù đã được sử dụng; ca đã chốt vắng và không thể chấm lại.";
        }
        if ("ABSENT".equalsIgnoreCase(attendanceStatus)) {
            return "Ca đã được ghi nhận vắng; không thể chấm lại trong ngày này.";
        }
        if ("COMPLETED".equalsIgnoreCase(attendanceStatus)) {
            return "Ca đã hoàn thành; không thể chấm lại trong ngày này.";
        }
        if ("CHECKED_IN".equalsIgnoreCase(attendanceStatus)) {
            return "Bạn đang có lượt chấm công đang mở cho ca này.";
        }
        if (attendanceClaimed) {
            return "Ca đã có dữ liệu chấm công và không thể chấm lại.";
        }
        if (isWithinCheckInWindow(assignment, currentTime)) {
            if (assignment.isLateCheckInApproved()
                    && currentTime.isAfter(scheduledStartAt(assignment)
                    .plusMinutes(allowedLateCheckInMinutes(assignment)))) {
                return "Quản lý đã cho phép chấm công muộn cho ca này.";
            }
            return "Có thể bắt đầu ca trong khung hiện tại.";
        }
        return windowMessage(assignment, currentTime);
    }

    private void validateTemplateTimes(LocalTime startTime, LocalTime endTime, boolean crossesMidnight) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Giờ bắt đầu và giờ kết thúc là bắt buộc.");
        }
        if (startTime.equals(endTime)) {
            throw new BadRequestException("Giờ bắt đầu và giờ kết thúc không được giống nhau.");
        }
        if (!crossesMidnight && !startTime.isBefore(endTime)) {
            throw new BadRequestException("Ca không qua ngày phải có giờ bắt đầu trước giờ kết thúc.");
        }
        if (crossesMidnight && !startTime.isAfter(endTime)) {
            throw new BadRequestException("Ca qua ngày phải có giờ bắt đầu sau giờ kết thúc.");
        }
    }

    private void validateTemplateDurations(LocalTime startTime, LocalTime endTime, boolean crossesMidnight,
                                           int breakMinutes, int earlyCheckInMinutes, int lateCheckInMinutes) {
        if (breakMinutes < 0 || earlyCheckInMinutes < 0 || lateCheckInMinutes < 0) {
            throw new BadRequestException("Thời gian nghỉ và khung chấm công không được âm.");
        }
        LocalDate baseDate = LocalDate.of(2000, 1, 1);
        LocalDateTime start = LocalDateTime.of(baseDate, startTime);
        LocalDateTime end = LocalDateTime.of(crossesMidnight ? baseDate.plusDays(1) : baseDate, endTime);
        long shiftMinutes = Duration.between(start, end).toMinutes();
        if (breakMinutes >= shiftMinutes) {
            throw new BadRequestException("Thời gian nghỉ phải nhỏ hơn tổng thời lượng ca.");
        }
    }

    private boolean overlaps(ShiftAssignment existing, ShiftTemplate candidateTemplate, LocalDate candidateDate) {
        LocalDateTime candidateStart = LocalDateTime.of(candidateDate, candidateTemplate.getStartTime());
        LocalDate candidateEndDate = candidateTemplate.isCrossesMidnight() ? candidateDate.plusDays(1) : candidateDate;
        LocalDateTime candidateEnd = LocalDateTime.of(candidateEndDate, candidateTemplate.getEndTime());
        LocalDateTime existingStart = scheduledStartAt(existing);
        LocalDateTime existingEnd = scheduledEndAt(existing);
        return candidateStart.isBefore(existingEnd) && existingStart.isBefore(candidateEnd);
    }

    private void validateTemplateForProject(ShiftTemplate template, Project project, String label) {
        if (!"ACTIVE".equals(template.getStatus())) {
            throw new BadRequestException(label + " đã ngừng sử dụng.");
        }
        if (template.getProject() != null && !template.getProject().getId().equals(project.getId())) {
            throw new BadRequestException(label + " không thuộc dự án được chọn.");
        }
    }

    private boolean isFullDayAdministrativeShift(ShiftTemplate template) {
        return template != null && !template.isCrossesMidnight()
                && ADMIN_MORNING_START.equals(template.getStartTime())
                && ADMIN_DAY_END.equals(template.getEndTime());
    }

    private String fullDayNote(String baseNotes) {
        String sessionNote = "Full ca hành chính · 08:00–17:30 · 1 checkout";
        return baseNotes == null ? sessionNote : baseNotes + " · " + sessionNote;
    }

    private ShiftAssignment findAssignment(Long assignmentId) {
        return shiftAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy phân ca."));
    }

    /**
     * Notifications are a secondary side effect of assignment changes. A
     * notification failure must not roll back a valid shift assignment, so it
     * is logged for administrators while the staff member can still refresh
     * the attendance view and see the assignment.
     */
    private void notifyShiftAssigned(ShiftAssignment assignment) {
        if (notificationService == null || assignment == null) {
            return;
        }
        ShiftTemplate template = assignment.getShiftTemplate();
        try {
            notificationService.sendNotification(
                    assignment.getUser().getId(),
                    "Bạn được phân ca mới",
                    String.format(
                            "Bạn được phân %s (%s–%s%s) tại dự án %s vào ngày %s. Mở Chấm công để xem ca.",
                            template.getName(),
                            template.getStartTime().format(TIME_FORMAT),
                            template.getEndTime().format(TIME_FORMAT),
                            template.isCrossesMidnight() ? " hôm sau" : "",
                            assignment.getProject().getName(),
                            assignment.getWorkDate().format(DATE_FORMAT)),
                    "INFO",
                    "/attendance");
        } catch (RuntimeException exception) {
            log.warn("Could not create shift assignment notification: assignmentId={}, userId={}, reason={}",
                    assignment.getId(), assignment.getUser().getId(), exception.getMessage());
        }
    }

    private void notifyFullDayAssigned(User user, Project project, LocalDate workDate,
                                       ShiftTemplate fullDayTemplate) {
        if (notificationService == null || user == null || project == null || workDate == null) {
            return;
        }
        try {
            notificationService.sendNotification(
                    user.getId(),
                    "Bạn được phân full ca",
                    String.format(
                            "Bạn được phân Full ca hành chính tại dự án %s vào ngày %s: %s–%s, một lượt check-in và một lượt checkout. Mở Chấm công để xem ca.",
                            project.getName(),
                            workDate.format(DATE_FORMAT),
                            fullDayTemplate.getStartTime().format(TIME_FORMAT),
                            fullDayTemplate.getEndTime().format(TIME_FORMAT)),
                    "SUCCESS",
                    "/attendance");
        } catch (RuntimeException exception) {
            log.warn("Could not create full-day shift notification: userId={}, projectId={}, workDate={}, reason={}",
                    user.getId(), project.getId(), workDate, exception.getMessage());
        }
    }

    private void notifyShiftCancelled(ShiftAssignment assignment) {
        if (notificationService == null || assignment == null) {
            return;
        }
        ShiftTemplate template = assignment.getShiftTemplate();
        try {
            notificationService.sendNotification(
                    assignment.getUser().getId(),
                    "Phân ca đã hủy",
                    String.format(
                            "Ca %s (%s–%s%s) tại dự án %s ngày %s đã được hủy. Vui lòng kiểm tra lại lịch chấm công.",
                            template.getName(),
                            template.getStartTime().format(TIME_FORMAT),
                            template.getEndTime().format(TIME_FORMAT),
                            template.isCrossesMidnight() ? " hôm sau" : "",
                            assignment.getProject().getName(),
                            assignment.getWorkDate().format(DATE_FORMAT)),
                    "WARNING",
                    "/attendance");
        } catch (RuntimeException exception) {
            log.warn("Could not create shift cancellation notification: assignmentId={}, userId={}, reason={}",
                    assignment.getId(), assignment.getUser().getId(), exception.getMessage());
        }
    }

    private void notifyLateCheckInApproved(ShiftAssignment assignment) {
        if (notificationService == null || assignment == null) {
            return;
        }
        try {
            notificationService.sendNotification(
                    assignment.getUser().getId(),
                    "Đã được mở chấm công đặc thù",
                    String.format(
                            "Quản lý đã mở quyền chấm công muộn cho ca %s tại dự án %s ngày %s. Lý do: %s",
                            assignment.getShiftTemplate().getName(),
                            assignment.getProject().getName(),
                            assignment.getWorkDate().format(DATE_FORMAT),
                            assignment.getLateCheckInApprovalNote()),
                    "INFO",
                    "/attendance");
        } catch (RuntimeException exception) {
            log.warn("Could not create late check-in approval notification: assignmentId={}, userId={}, reason={}",
                    assignment.getId(), assignment.getUser().getId(), exception.getMessage());
        }
    }

    private Project findProject(Integer projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy dự án."));
    }

    private ProjectMember requireActiveMember(Integer projectId, Long userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .filter(ProjectMember::isActive)
                .orElseThrow(() -> new BadRequestException("Nhân viên chưa được phân công vào dự án này."));
    }

    private void requireActiveMemberIfStaff(Integer projectId, Long userId) {
        if (!isManager()) {
            requireActiveMember(projectId, userId);
        }
    }

    private void validateUserScope(Long requestedUserId) {
        if (isManager()) return;
        if (!currentUser().getId().equals(requestedUserId)) {
            throw new AccessDeniedException("Bạn chỉ được xem lịch phân ca của chính mình.");
        }
    }

    private void requireManager() {
        if (!isManager()) {
            throw new AccessDeniedException("Chỉ quản trị viên hoặc quản lý dự án được quản lý phân ca.");
        }
    }

    private boolean isManager() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && authentication.getAuthorities().stream().anyMatch(authority ->
                authority.getAuthority().equals("ROLE_ADMIN") || authority.getAuthority().equals("ROLE_PM"));
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để xem lịch phân ca.");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Không xác định được tài khoản hiện tại."));
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new BadRequestException("Khoảng ngày phân ca không hợp lệ.");
        }
    }

    private int defaultZero(Integer value) {
        return value == null ? 0 : value;
    }

    private int defaultValue(Integer value, int fallback) {
        return value == null ? fallback : value;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
