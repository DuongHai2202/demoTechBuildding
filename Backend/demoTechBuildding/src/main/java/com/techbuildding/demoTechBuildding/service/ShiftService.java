package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftAssignmentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.shift.FullDayShiftAssignmentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftTemplateRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.shift.ShiftAssignmentResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.shift.ShiftTemplateResponseDTO;
import com.techbuildding.demoTechBuildding.entity.ShiftAssignment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShiftService {

    List<ShiftTemplateResponseDTO> getTemplates(Integer projectId);

    ShiftTemplateResponseDTO createTemplate(ShiftTemplateRequestDTO request);

    List<ShiftAssignmentResponseDTO> getAssignments(LocalDate from, LocalDate to, Integer projectId, Long userId);

    ShiftAssignmentResponseDTO getCurrentAssignment(Long userId, Integer projectId, LocalDate date);

    ShiftAssignmentResponseDTO createAssignment(ShiftAssignmentRequestDTO request);

    /** Assigns one continuous administrative workday from 08:00 to 17:30. */
    ShiftAssignmentResponseDTO createFullDayAssignment(FullDayShiftAssignmentRequestDTO request);

    /** Allows one assigned shift to accept a late check-in with an audit reason. */
    ShiftAssignmentResponseDTO approveLateCheckIn(Long assignmentId, String reason);

    /** Revokes a late check-in approval before the employee checks in. */
    void revokeLateCheckIn(Long assignmentId);

    void cancelAssignment(Long assignmentId);

    /** Require a valid assigned shift for a staff check-in. */
    ShiftAssignment requireCheckInAssignment(Long userId, Integer projectId, LocalDateTime now);

    /** Find an applicable shift for managers, without requiring one. */
    Optional<ShiftAssignment> findApplicableAssignment(Long userId, Integer projectId, LocalDateTime now);

    /** Find an assigned shift that has already exceeded its late check-in limit. */
    Optional<ShiftAssignment> findLateCheckInAssignment(Long userId, Integer projectId, LocalDateTime now);

    /** Persist ABSENT records for assigned shifts missed beyond the late limit. */
    int finalizeMissedAssignments(LocalDateTime now);

    LocalDateTime scheduledStartAt(ShiftAssignment assignment);

    LocalDateTime scheduledEndAt(ShiftAssignment assignment);

    /**
     * Returns the final time at which an open attendance record may be closed.
     * Administrative overtime shifts remain open through the 3h30 overtime
     * window; other shifts use their scheduled end.
     */
    LocalDateTime missedCheckoutCutoffAt(ShiftAssignment assignment);

    long lateMinutes(ShiftAssignment assignment, LocalDateTime actualCheckIn);

    long allowedLateCheckInMinutes(ShiftAssignment assignment);

    boolean isLateBeyondCheckInLimit(ShiftAssignment assignment, LocalDateTime actualCheckIn);

    long earlyLeaveMinutes(ShiftAssignment assignment, LocalDateTime actualCheckOut);

    long overtimeMinutes(ShiftAssignment assignment, LocalDateTime actualCheckOut);
}
