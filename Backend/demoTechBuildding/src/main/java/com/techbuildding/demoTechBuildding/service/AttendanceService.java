package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.attendance.CheckInRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.CheckOutRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.attendance.LogFailureRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for attendance check-in/out and history.
 */
public interface AttendanceService {

    /**
     * Check-in with GPS and optional selfie photo.
     * Validates geofencing before allowing check-in.
     */
    AttendanceResponseDTO checkIn(Long userId, CheckInRequestDTO request, MultipartFile selfie);

    /**
     * Check-out with GPS and optional selfie photo.
     */
    AttendanceResponseDTO checkOut(Long userId, Integer projectId, CheckOutRequestDTO request, MultipartFile selfie);

    /**
     * Get personal attendance history for a user.
     */
    List<AttendanceResponseDTO> getPersonalHistory(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * Get all attendance logs for a project within a date range.
     */
    List<AttendanceResponseDTO> getProjectHistory(Integer projectId, LocalDate startDate, LocalDate endDate);

    /**
     * Get all attendance logs for all projects within a date range.
     */
    List<AttendanceResponseDTO> getAllLogs(LocalDate startDate, LocalDate endDate);

    /**
     * Get today's check-in record for a user on a project (null if not checked in).
     */
    AttendanceResponseDTO getTodayRecord(Long userId, Integer projectId);

    /**
     * Log a failed attendance attempt (e.g. from frontend geofencing or face mismatch).
     */
    void logFailure(LogFailureRequestDTO request);
}
