package com.techbuildding.demoTechBuildding.mapper;

import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceResponseDTO;
import com.techbuildding.demoTechBuildding.entity.AttendanceLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.Duration;
import java.time.LocalDateTime;
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
    @Mapping(target = "workingHours", expression = "java(calcHours(log.getCheckInAt(), log.getCheckOutAt()))")
    AttendanceResponseDTO toResponseDTO(AttendanceLog log);

    List<AttendanceResponseDTO> toResponseDTOList(List<AttendanceLog> logs);

    /**
     * Calculate working hours from check-in to check-out.
     */
    default Double calcHours(LocalDateTime checkIn, LocalDateTime checkOut) {
        if (checkIn == null || checkOut == null)
            return null;
        return Duration.between(checkIn, checkOut).toMinutes() / 60.0;
    }
}
