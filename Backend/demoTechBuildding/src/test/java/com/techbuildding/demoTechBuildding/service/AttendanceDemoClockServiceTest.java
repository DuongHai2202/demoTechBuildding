package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.attendance.AttendanceDemoClockRequestDTO;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.service.impl.AttendanceDemoClockService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AttendanceDemoClockServiceTest {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Test
    void adminCanSetAndResetShortLivedDemoClock() {
        AttendanceDemoClockService service = new AttendanceDemoClockService(true);
        LocalDateTime demoTime = LocalDateTime.now(BUSINESS_ZONE)
                .plusMinutes(15)
                .withSecond(0)
                .withNano(0);

        AttendanceDemoClockRequestDTO request = new AttendanceDemoClockRequestDTO();
        request.setDemoTime(demoTime);
        request.setEnabled(true);

        var enabled = service.update(request, "admin");
        assertTrue(enabled.isFeatureEnabled());
        assertTrue(enabled.isEnabled());
        assertEquals(demoTime, service.now());
        assertEquals("admin", enabled.getUpdatedBy());

        var reset = service.reset("admin");
        assertFalse(reset.isEnabled());
        assertTrue(reset.getEffectiveTime().isAfter(demoTime.minusHours(1)));
    }

    @Test
    void disabledEnvironmentRejectsDemoClockChanges() {
        AttendanceDemoClockService service = new AttendanceDemoClockService(false);
        AttendanceDemoClockRequestDTO request = new AttendanceDemoClockRequestDTO();
        request.setDemoTime(LocalDateTime.now(BUSINESS_ZONE));
        request.setEnabled(true);

        assertThrows(BadRequestException.class, () -> service.update(request, "admin"));
        assertFalse(service.getStatus().isFeatureEnabled());
        assertFalse(service.getStatus().isEnabled());
    }
}
