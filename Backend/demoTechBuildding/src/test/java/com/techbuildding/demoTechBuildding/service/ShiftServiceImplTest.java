package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.entity.ShiftAssignment;
import com.techbuildding.demoTechBuildding.entity.ShiftTemplate;
import com.techbuildding.demoTechBuildding.service.impl.ShiftServiceImpl;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ShiftServiceImplTest {

    private final ShiftServiceImpl service = new ShiftServiceImpl(null, null, null, null, null, null);
    private final LocalDate workDate = LocalDate.of(2026, 9, 29);

    @Test
    void morningShiftDoesNotGenerateOvertimeAfterNoon() {
        ShiftAssignment assignment = assignment("CA-SANG", LocalTime.of(8, 0), LocalTime.NOON, false, false);

        assertEquals(LocalDateTime.of(workDate, LocalTime.NOON), service.scheduledEndAt(assignment));
        assertEquals(0, service.overtimeMinutes(assignment, LocalDateTime.of(workDate, LocalTime.of(13, 30))));
    }

    @Test
    void afternoonShiftGeneratesOvertimeOnlyAfter1730() {
        ShiftAssignment assignment = assignment("CA-CHIEU", LocalTime.of(13, 0), LocalTime.of(17, 30), false, true);

        assertEquals(0, service.overtimeMinutes(assignment, LocalDateTime.of(workDate, LocalTime.of(17, 30))));
        assertEquals(60, service.overtimeMinutes(assignment, LocalDateTime.of(workDate, LocalTime.of(18, 15))));
        assertEquals(210, service.overtimeMinutes(assignment, LocalDateTime.of(workDate, LocalTime.of(22, 0))));
    }

    @Test
    void nightShiftNeverGeneratesOvertime() {
        ShiftAssignment assignment = assignment("CA-DEM", LocalTime.of(22, 0), LocalTime.of(6, 0), true, true);

        assertEquals(LocalDateTime.of(workDate.plusDays(1), LocalTime.of(6, 0)), service.scheduledEndAt(assignment));
        assertEquals(0, service.overtimeMinutes(assignment, LocalDateTime.of(workDate.plusDays(1), LocalTime.of(6, 30))));
    }

    private ShiftAssignment assignment(String code, LocalTime start, LocalTime end,
                                       boolean crossesMidnight, boolean overtimeEligible) {
        ShiftTemplate template = ShiftTemplate.builder()
                .code(code)
                .name(code)
                .startTime(start)
                .endTime(end)
                .crossesMidnight(crossesMidnight)
                .overtimeEligible(overtimeEligible)
                .build();
        return ShiftAssignment.builder()
                .shiftTemplate(template)
                .workDate(workDate)
                .build();
    }
}
