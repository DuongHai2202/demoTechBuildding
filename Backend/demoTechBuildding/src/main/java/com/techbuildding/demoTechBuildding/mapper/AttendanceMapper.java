package com.techbuildding.demoTechBuildding.mapper;

import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceResponseDTO;
import com.techbuildding.demoTechBuildding.entity.AttendanceLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

/**
 * MapStruct mapper for AttendanceLog entity.
 */
@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "projectName", source = "project.name")
    @Mapping(target = "shiftAssignmentId", source = "shiftAssignment.id")
    @Mapping(target = "shiftCode", source = "shiftAssignment.shiftTemplate.code")
    @Mapping(target = "shiftName", source = "shiftAssignment.shiftTemplate.name")
    @Mapping(target = "status", expression = "java(resolveStatus(log))")
    @Mapping(target = "workingHours", expression = "java(calcHours(log.getCheckInAt(), log.getCheckOutAt(), log.getBreakMinutes()))")
    @Mapping(target = "workingMinutes", expression = "java(calcMinutes(log.getCheckInAt(), log.getCheckOutAt(), log.getBreakMinutes()))")
    @Mapping(target = "durationText", expression = "java(formatDuration(log.getCheckInAt(), log.getCheckOutAt(), log.getBreakMinutes()))")
    AttendanceResponseDTO toResponseDTO(AttendanceLog log);

    List<AttendanceResponseDTO> toResponseDTOList(List<AttendanceLog> logs);

    /**
     * Calculate working hours from check-in to check-out.
     */
    default Double calcHours(LocalDateTime checkIn, LocalDateTime checkOut) {
        return calcHours(checkIn, checkOut, 0);
    }

    default Double calcHours(LocalDateTime checkIn, LocalDateTime checkOut, Integer breakMinutes) {
        Long minutes = calcMinutes(checkIn, checkOut, breakMinutes);
        if (minutes == null)
            return null;
        return minutes / 60.0;
    }

    default Long calcMinutes(LocalDateTime checkIn, LocalDateTime checkOut) {
        return calcMinutes(checkIn, checkOut, 0);
    }

    default Long calcMinutes(LocalDateTime checkIn, LocalDateTime checkOut, Integer breakMinutes) {
        if (checkIn == null || checkOut == null)
            return null;
        Duration duration = Duration.between(checkIn, checkOut);
        if (duration.isNegative())
            return null;
        return Math.max(0, duration.toMinutes() - (breakMinutes == null ? 0 : breakMinutes));
    }

    default String formatDuration(LocalDateTime checkIn, LocalDateTime checkOut) {
        return formatDuration(checkIn, checkOut, 0);
    }

    default String formatDuration(LocalDateTime checkIn, LocalDateTime checkOut, Integer breakMinutes) {
        Long minutes = calcMinutes(checkIn, checkOut, breakMinutes);
        if (minutes == null)
            return null;
        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;
        if (hours == 0)
            return remainingMinutes + " phút";
        if (remainingMinutes == 0)
            return hours + " giờ";
        return hours + " giờ " + remainingMinutes + " phút";
    }

    /** Keep the stored event immutable while making an abandoned open shift visible in history. */
    default String resolveStatus(AttendanceLog log) {
        if ("CHECKED_IN".equals(log.getStatus())
                && log.getCheckOutAt() == null
                && log.getCheckInAt() != null
                && log.getCheckInAt().toLocalDate().isBefore(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))) {
            return "MISSING_CHECKOUT";
        }
        return log.getStatus();
    }
}
