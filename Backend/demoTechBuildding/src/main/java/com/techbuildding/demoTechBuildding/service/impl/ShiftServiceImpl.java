package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftAssignmentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftTemplateRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.shift.ShiftAssignmentResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.shift.ShiftTemplateResponseDTO;
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
    private static final Set<String> COMPLETED_STATUSES = Set.of("COMPLETED");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final Pattern CODE_PATTERN = Pattern.compile("[A-Z0-9][A-Z0-9_-]{1,49}");
    private static final LocalTime ADMIN_MORNING_START = LocalTime.of(8, 0);
    private static final LocalTime ADMIN_AFTERNOON_START = LocalTime.of(13, 0);
    private static final LocalTime ADMIN_DAY_END = LocalTime.of(17, 30);
    private static final long MIN_OVERTIME_MINUTES = 60L;
    private static final long MAX_OVERTIME_MINUTES = 210L;

    private final ShiftTemplateRepository shiftTemplateRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

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
        int lateCheckInMinutes = defaultValue(request.getLateCheckInMinutes(), 120);
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
        List<ShiftAssignment> candidates = findCandidates(userId, projectId, effectiveDate);
        if (candidates.isEmpty()) {
            return null;
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
        return toAssignmentResponse(saved, LocalDateTime.now(BUSINESS_ZONE));
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
    public long lateMinutes(ShiftAssignment assignment, LocalDateTime actualCheckIn) {
        return Math.max(0, Duration.between(scheduledStartAt(assignment), actualCheckIn).toMinutes());
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
                .filter(assignment -> !attendanceLogRepository.existsByShiftAssignmentAndStatusIn(
                        assignment.getId(), COMPLETED_STATUSES))
                .toList();
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
        LocalDateTime end = scheduledEndAt(assignment).plusMinutes(assignment.getShiftTemplate().getLateCheckInMinutes());
        return !currentTime.isBefore(start) && !currentTime.isAfter(end);
    }

    private String windowMessage(ShiftAssignment assignment, LocalDateTime currentTime) {
        LocalDateTime start = scheduledStartAt(assignment);
        LocalDateTime end = scheduledEndAt(assignment);
        if (currentTime.isBefore(start.minusMinutes(assignment.getShiftTemplate().getEarlyCheckInMinutes()))) {
            return "Ca " + assignment.getShiftTemplate().getName() + " bắt đầu lúc " + start.format(TIME_FORMAT) + ". Vui lòng quay lại trong khung chấm công.";
        }
        return "Khung chấm công của ca " + assignment.getShiftTemplate().getName() + " đã kết thúc lúc "
                + end.plusMinutes(assignment.getShiftTemplate().getLateCheckInMinutes()).format(TIME_FORMAT) + ".";
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
        response.setLateCheckInMinutes(template.getLateCheckInMinutes());
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
        response.setLateCheckInMinutes(template.getLateCheckInMinutes());
        response.setOvertimeEligible(template.isOvertimeEligible());
        response.setWorkDate(assignment.getWorkDate());
        response.setScheduledStartAt(scheduledStartAt(assignment));
        response.setScheduledEndAt(scheduledEndAt(assignment));
        response.setStatus(assignment.getStatus());
        response.setNotes(assignment.getNotes());
        response.setCurrent(isWithinCheckInWindow(assignment, currentTime));
        response.setEligibleForCheckIn(response.isCurrent());
        response.setWindowMessage(response.isCurrent() ? "Có thể bắt đầu ca trong khung hiện tại." : windowMessage(assignment, currentTime));
        return response;
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
