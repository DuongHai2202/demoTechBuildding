package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.attendance.CheckInRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.CheckOutRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.AttendanceCorrectionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.AttendanceDemoClockRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.LogFailureRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.OvertimeReviewRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceDemoClockResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceEffectiveClockResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.service.AttendanceService;
import com.techbuildding.demoTechBuildding.service.impl.AttendanceDemoClockService;
import com.techbuildding.demoTechBuildding.service.impl.ExcelExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Controller for Attendance operations:
 * - Check-in (GPS + Selfie validation)
 * - Check-out (GPS + Selfie)
 * - Personal/Project history
 * - Export Excel report
 *
 * All endpoints require JWT authentication.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance controller", description = "APIs for check-in, check-out, attendance history, and excel report export")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceDemoClockService attendanceDemoClockService;
    private final ExcelExportService excelExportService;
    private final ProjectRepository projectRepository;

    // ==================== CHECK-IN ====================

    @Operation(summary = "Check in", description = "Check in to a project with GPS coordinates. Geofencing validation is performed — user must be within the project's radius. Optionally upload a selfie photo.")
    @PostMapping(value = "/check-in", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseData<AttendanceResponseDTO> checkIn(
            @Parameter(description = "User ID") @RequestParam("userId") Long userId,
            @Valid @RequestPart("data") CheckInRequestDTO request,
            @Parameter(description = "Selfie photo (optional)") @RequestPart(value = "selfie", required = false) MultipartFile selfie) {

        log.info("Check-in request: userId={}, projectId={}", userId, request.getProjectId());
        AttendanceResponseDTO result = attendanceService.checkIn(userId, request, selfie);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Check-in successful", result);
    }

    // ==================== CHECK-OUT ====================

    @Operation(summary = "Check out", description = "Check out from a project. Must have an active check-in session. Optionally upload a selfie photo.")
    @PostMapping(value = "/check-out/{projectId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseData<AttendanceResponseDTO> checkOut(
            @Parameter(description = "User ID") @RequestParam("userId") Long userId,
            @Parameter(description = "Project ID") @PathVariable("projectId") Integer projectId,
            @Valid @RequestPart("data") CheckOutRequestDTO request,
            @Parameter(description = "Selfie photo (optional)") @RequestPart(value = "selfie", required = false) MultipartFile selfie) {

        log.info("Check-out request: userId={}, projectId={}", userId, projectId);
        AttendanceResponseDTO result = attendanceService.checkOut(userId, projectId, request, selfie);
        return new ResponseData<>(HttpStatus.OK.value(), "Check-out successful", result);
    }

    // ==================== ADMIN DEMO CLOCK ====================

    @Operation(summary = "Get attendance demo clock status",
            description = "Admin-only status for the short-lived server-side clock override used during demonstrations.")
    @GetMapping("/demo-clock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseData<AttendanceDemoClockResponseDTO> getDemoClock() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", attendanceDemoClockService.getStatus());
    }

    @Operation(summary = "Set attendance demo clock",
            description = "Admin-only. Changes the effective server time for attendance and shift rules in the demo environment.")
    @PutMapping("/demo-clock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseData<AttendanceDemoClockResponseDTO> updateDemoClock(
            @Valid @RequestBody AttendanceDemoClockRequestDTO request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return new ResponseData<>(HttpStatus.OK.value(), "Đã cập nhật đồng hồ demo",
                attendanceDemoClockService.update(request, username));
    }

    @Operation(summary = "Reset attendance demo clock")
    @DeleteMapping("/demo-clock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseData<AttendanceDemoClockResponseDTO> resetDemoClock() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return new ResponseData<>(HttpStatus.OK.value(), "Đã tắt đồng hồ demo",
                attendanceDemoClockService.reset(username));
    }

    @Operation(summary = "Get effective attendance clock",
            description = "Returns the server/demo time used by shift eligibility and attendance rules.")
    @GetMapping("/effective-clock")
    public ResponseData<AttendanceEffectiveClockResponseDTO> getEffectiveClock() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success",
                new AttendanceEffectiveClockResponseDTO(
                        attendanceDemoClockService.now(), attendanceDemoClockService.today()));
    }

    // ==================== FAILURE LOGGING ====================

    @Operation(summary = "Log a failed attendance attempt", description = "For cases where client-side validation fails (e.g. Geofence outside radius or AI scanning failure). Records the attempt with status FAILED.")
    @PostMapping("/log-failure")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseData<Void> logFailure(@Valid @RequestBody LogFailureRequestDTO request) {
        attendanceService.logFailure(request);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Failure logged successfully", null);
    }

    // ==================== HISTORY ====================

    @Operation(summary = "Get personal attendance history", description = "Get attendance logs for a specific user across all projects within a date range.")
    @GetMapping("/personal/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseData<List<AttendanceResponseDTO>> getPersonalHistory(
            @Parameter(description = "User ID") @PathVariable("userId") Long userId,
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2026-03-01") @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2026-03-31") @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<AttendanceResponseDTO> result = attendanceService.getPersonalHistory(userId, startDate, endDate);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", result);
    }

    @Operation(summary = "Get project attendance history", description = "Get all attendance logs for a project within a date range.")
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseData<List<AttendanceResponseDTO>> getProjectHistory(
            @Parameter(description = "Project ID") @PathVariable("projectId") Integer projectId,
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2026-03-01") @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2026-03-31") @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<AttendanceResponseDTO> result = attendanceService.getProjectHistory(projectId, startDate, endDate);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", result);
    }

    @Operation(summary = "Get today's check-in status", description = "Get today's active check-in record for a user on a specific project. Returns null if not checked in.")
    @GetMapping("/today")
    public ResponseData<AttendanceResponseDTO> getTodayRecord(
            @Parameter(description = "User ID") @RequestParam("userId") Long userId,
            @Parameter(description = "Project ID") @RequestParam("projectId") Integer projectId) {

        AttendanceResponseDTO result = attendanceService.getTodayRecord(userId, projectId);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", result);
    }

    @Operation(summary = "Review overtime", description = "Approve all or part of the calculated overtime, or reject it with a reason. Only ADMIN/PM can review.")
    @PatchMapping("/{attendanceId}/overtime")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseData<AttendanceResponseDTO> reviewOvertime(
            @Parameter(description = "Attendance log ID") @PathVariable("attendanceId") Long attendanceId,
            @Valid @RequestBody OvertimeReviewRequestDTO request) {

        log.info("Overtime review request: attendanceId={}, status={}, approvedMinutes={}",
                attendanceId, request.getStatus(), request.getApprovedMinutes());
        AttendanceResponseDTO result = attendanceService.reviewOvertime(attendanceId, request);
        return new ResponseData<>(HttpStatus.OK.value(), "Đã cập nhật xử lý tăng ca.", result);
    }

    @Operation(summary = "Điều chỉnh lượt chấm công",
            description = "ADMIN/PM điều chỉnh COMPLETED hoặc ABSENT; bắt buộc nhập lý do để lưu audit.")
    @PatchMapping("/{attendanceId}/correction")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseData<AttendanceResponseDTO> correctAttendance(
            @Parameter(description = "Attendance log ID") @PathVariable("attendanceId") Long attendanceId,
            @Valid @RequestBody AttendanceCorrectionRequestDTO request) {

        log.info("Attendance correction request: attendanceId={}, status={}",
                attendanceId, request.getStatus());
        AttendanceResponseDTO result = attendanceService.correctAttendance(attendanceId, request);
        return new ResponseData<>(HttpStatus.OK.value(), "Đã lưu điều chỉnh chấm công.", result);
    }

    @Operation(summary = "Get all attendance logs", description = "Get all attendance logs across all projects within a date range.")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseData<List<AttendanceResponseDTO>> getAllLogs(
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2026-03-01") @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2026-03-31") @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<AttendanceResponseDTO> result = attendanceService.getAllLogs(startDate, endDate);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", result);
    }

    // ==================== EXCEL EXPORT ====================

    @Operation(summary = "Export attendance report to Excel", description = "Download an .xlsx attendance report for a project within a date range.")
    @GetMapping("/export/excel/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseEntity<byte[]> exportExcel(
            @Parameter(description = "Project ID") @PathVariable("projectId") Integer projectId,
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2026-03-01") @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2026-03-31") @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Export Excel: projectId={}, {} to {}", projectId, startDate, endDate);

        List<AttendanceResponseDTO> logs = attendanceService.getProjectHistory(projectId, startDate, endDate);

        // Get project name for report title
        String projectName = projectRepository.findById(projectId)
                .map(Project::getName)
                .orElse("Project " + projectId);

        byte[] excelBytes = excelExportService.exportAttendanceToExcel(logs, projectName, startDate, endDate);

        String filename = String.format("attendance_%s_%s_to_%s.xlsx",
                projectId,
                startDate.format(DateTimeFormatter.ofPattern("yyyyMMdd")),
                endDate.format(DateTimeFormatter.ofPattern("yyyyMMdd")));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(excelBytes.length);

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }
}
