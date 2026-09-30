package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.shift.ShiftAssignmentRequestDTO;
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

    void cancelAssignment(Long assignmentId);

    /** Require a valid assigned shift for a staff check-in. */
    ShiftAssignment requireCheckInAssignment(Long userId, Integer projectId, LocalDateTime now);

    /** Find an applicable shift for managers, without requiring one. */
    Optional<ShiftAssignment> findApplicableAssignment(Long userId, Integer projectId, LocalDateTime now);

    LocalDateTime scheduledStartAt(ShiftAssignment assignment);

    LocalDateTime scheduledEndAt(ShiftAssignment assignment);

    long lateMinutes(ShiftAssignment assignment, LocalDateTime actualCheckIn);

    long earlyLeaveMinutes(ShiftAssignment assignment, LocalDateTime actualCheckOut);

    long overtimeMinutes(ShiftAssignment assignment, LocalDateTime actualCheckOut);
}
