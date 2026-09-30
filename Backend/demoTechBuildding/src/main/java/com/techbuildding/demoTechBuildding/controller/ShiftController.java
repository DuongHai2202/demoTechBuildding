package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftAssignmentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.shift.FullDayShiftAssignmentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.shift.LateCheckInApprovalRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftTemplateRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.shift.ShiftAssignmentResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.shift.ShiftTemplateResponseDTO;
import com.techbuildding.demoTechBuildding.service.ShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shifts")
@RequiredArgsConstructor
@Tag(name = "Shift scheduling", description = "Shift templates and daily assignments")
public class ShiftController {

    private final ShiftService shiftService;

    @Operation(summary = "List active shift templates")
    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseData<List<ShiftTemplateResponseDTO>> getTemplates(
            @RequestParam(value = "projectId", required = false) Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", shiftService.getTemplates(projectId));
    }

    @Operation(summary = "Create a shift template")
    @PostMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<ShiftTemplateResponseDTO> createTemplate(
            @Valid @RequestBody ShiftTemplateRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Tạo mẫu ca thành công", shiftService.createTemplate(request));
    }

    @Operation(summary = "List shift assignments")
    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseData<List<ShiftAssignmentResponseDTO>> getAssignments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "projectId", required = false) Integer projectId,
            @RequestParam(value = "userId", required = false) Long userId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", shiftService.getAssignments(from, to, projectId, userId));
    }

    @Operation(summary = "Get the current or next assignment for a user")
    @GetMapping("/assignments/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM', 'STAFF')")
    public ResponseData<ShiftAssignmentResponseDTO> getCurrentAssignment(
            @RequestParam Long userId,
            @RequestParam Integer projectId,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", shiftService.getCurrentAssignment(userId, projectId, date));
    }

    @Operation(summary = "Assign a shift for one project member and date")
    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<ShiftAssignmentResponseDTO> createAssignment(
            @Valid @RequestBody ShiftAssignmentRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Phân ca thành công", shiftService.createAssignment(request));
    }

    @Operation(summary = "Assign one full administrative day from 08:00 to 17:30")
    @PostMapping("/assignments/full-day")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<ShiftAssignmentResponseDTO> createFullDayAssignment(
            @Valid @RequestBody FullDayShiftAssignmentRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(),
                "Đã phân Full ca 08:00–17:30", shiftService.createFullDayAssignment(request));
    }

    @Operation(summary = "Approve a late check-in for one assignment")
    @PostMapping("/assignments/{assignmentId}/late-checkin")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseData<ShiftAssignmentResponseDTO> approveLateCheckIn(
            @PathVariable Long assignmentId,
            @Valid @RequestBody LateCheckInApprovalRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Đã mở chấm công đặc thù",
                shiftService.approveLateCheckIn(assignmentId, request.getReason()));
    }

    @Operation(summary = "Revoke a late check-in approval")
    @DeleteMapping("/assignments/{assignmentId}/late-checkin")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseData<Void> revokeLateCheckIn(@PathVariable Long assignmentId) {
        shiftService.revokeLateCheckIn(assignmentId);
        return new ResponseData<>(HttpStatus.OK.value(), "Đã thu hồi quyền chấm công muộn");
    }

    @Operation(summary = "Cancel an assignment without deleting its audit trail")
    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    public ResponseData<Void> cancelAssignment(@PathVariable Long assignmentId) {
        shiftService.cancelAssignment(assignmentId);
        return new ResponseData<>(HttpStatus.OK.value(), "Đã hủy phân ca");
    }
}
