package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.attendance.AttendanceDemoClockRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceDemoClockResponseDTO;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Provides the server-side business time used by attendance and shift rules.
 *
 * The override is intentionally in-memory and short-lived. It is a demo/test
 * aid, not a way to rewrite historical timestamps. Production can disable the
 * feature with ATTENDANCE_DEMO_CLOCK_ENABLED=false.
 */
@Slf4j
@Service
public class AttendanceDemoClockService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Duration MAX_OVERRIDE_DURATION = Duration.ofHours(2);

    private final boolean featureEnabled;
    private volatile LocalDateTime demoTime;
    private volatile LocalDateTime updatedAt;
    private volatile LocalDateTime expiresAt;
    private volatile String updatedBy;

    public AttendanceDemoClockService(
            @Value("${attendance.demo-clock.enabled:false}") boolean featureEnabled) {
        this.featureEnabled = featureEnabled;
    }

    public LocalDateTime now() {
        LocalDateTime actualTime = actualNow();
        LocalDateTime currentDemoTime = demoTime;
        LocalDateTime currentExpiresAt = expiresAt;

        if (!featureEnabled || currentDemoTime == null) {
            return actualTime;
        }
        if (currentExpiresAt != null && actualTime.isAfter(currentExpiresAt)) {
            resetInternal("auto-expired");
            return actualTime;
        }
        return currentDemoTime;
    }

    public LocalDate today() {
        return now().toLocalDate();
    }

    public synchronized AttendanceDemoClockResponseDTO getStatus() {
        LocalDateTime actualTime = actualNow();
        LocalDateTime effectiveTime = now();
        return response(actualTime, effectiveTime, featureEnabled
                ? (demoTime == null ? "Đang dùng giờ thật của server." : "Đồng hồ demo đang sẵn sàng.")
                : "Chế độ đồng hồ demo đang tắt trên môi trường này.");
    }

    public synchronized AttendanceDemoClockResponseDTO update(
            AttendanceDemoClockRequestDTO request,
            String username) {
        if (!featureEnabled) {
            throw new BadRequestException(
                    "Chế độ đồng hồ demo chưa được bật trên môi trường này. Hãy bật ATTENDANCE_DEMO_CLOCK_ENABLED ở môi trường demo.");
        }
        if (request == null || request.getDemoTime() == null || request.getEnabled() == null) {
            throw new BadRequestException("Vui lòng chọn thời gian và trạng thái đồng hồ demo.");
        }

        LocalDateTime actualTime = actualNow();
        LocalDateTime requestedTime = request.getDemoTime().withSecond(0).withNano(0);
        if (requestedTime.isBefore(actualTime.minusDays(365))
                || requestedTime.isAfter(actualTime.plusDays(365))) {
            throw new BadRequestException("Thời gian demo phải nằm trong khoảng một năm quanh thời gian hiện tại.");
        }

        if (!request.getEnabled()) {
            resetInternal(username);
            log.info("Attendance demo clock disabled by admin={}", username);
            return response(actualTime, actualTime, "Đã tắt đồng hồ demo; hệ thống quay về giờ thật của server.");
        }

        this.demoTime = requestedTime;
        this.updatedAt = actualTime;
        this.expiresAt = actualTime.plus(MAX_OVERRIDE_DURATION);
        this.updatedBy = username;
        log.warn("Attendance demo clock enabled by admin={}, demoTime={}, expiresAt={}",
                username, requestedTime, expiresAt);
        return response(actualTime, requestedTime,
                "Đã bật giờ demo. Chỉ dùng cho môi trường trình diễn; tự tắt sau 2 giờ.");
    }

    public synchronized AttendanceDemoClockResponseDTO reset(String username) {
        LocalDateTime actualTime = actualNow();
        resetInternal(username);
        log.info("Attendance demo clock reset by admin={}", username);
        return response(actualTime, actualTime, "Đã tắt đồng hồ demo; hệ thống quay về giờ thật của server.");
    }

    private AttendanceDemoClockResponseDTO response(
            LocalDateTime actualTime,
            LocalDateTime effectiveTime,
            String message) {
        return AttendanceDemoClockResponseDTO.builder()
                .featureEnabled(featureEnabled)
                .enabled(featureEnabled && demoTime != null)
                .actualTime(actualTime)
                .effectiveTime(effectiveTime)
                .demoTime(demoTime)
                .updatedAt(updatedAt)
                .expiresAt(expiresAt)
                .updatedBy(updatedBy)
                .message(message)
                .build();
    }

    private LocalDateTime actualNow() {
        return LocalDateTime.now(BUSINESS_ZONE).withNano(0);
    }

    private void resetInternal(String actor) {
        this.demoTime = null;
        this.updatedAt = actualNow();
        this.expiresAt = null;
        this.updatedBy = actor;
    }
}
