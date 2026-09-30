package com.techbuildding.demoTechBuildding.mapper;

import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceResponseDTO;
import com.techbuildding.demoTechBuildding.entity.AttendanceLog;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class AttendanceMapperTest {

    private final AttendanceMapper mapper = new AttendanceMapper() {
        @Override
        public AttendanceResponseDTO toResponseDTO(AttendanceLog log) {
            return null;
        }

        @Override
        public List<AttendanceResponseDTO> toResponseDTOList(List<AttendanceLog> logs) {
            return List.of();
        }
    };

    @Test
    void openShiftPastEndIsAbsentAndHasZeroWorkingMinutes() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        AttendanceLog log = AttendanceLog.builder()
                .status("CHECKED_IN")
                .checkInAt(now.minusHours(4))
                .scheduledEndAt(now.minusMinutes(1))
                .build();

        assertEquals("ABSENT", mapper.resolveStatus(log));
        assertEquals(0L, mapper.calcMinutes(log));
        assertEquals("0 phút", mapper.formatDuration(log));
    }

    @Test
    void openShiftBeforeEndRemainsCheckedInWithoutWorkingMinutes() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        AttendanceLog log = AttendanceLog.builder()
                .status("CHECKED_IN")
                .checkInAt(now.minusMinutes(30))
                .scheduledEndAt(now.plusMinutes(30))
                .build();

        assertEquals("CHECKED_IN", mapper.resolveStatus(log));
        assertNull(mapper.calcMinutes(log));
    }
}
