package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.notification.NotificationResponseDTO;
import com.techbuildding.demoTechBuildding.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Get my notifications (Assuming current user ID is handled by a helper or extracted from token)
    // For now, let's pass userId in param for simplicity or assume it's extracted from context later
    @GetMapping("/me/{userId}")
    public ResponseData<List<NotificationResponseDTO>> getMyNotifications(@PathVariable("userId") Long userId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", notificationService.getMyNotifications(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseData<Void> markAsRead(@PathVariable("id") Long id) {
        notificationService.markAsRead(id);
        return new ResponseData<>(HttpStatus.OK.value(), "Marked as read");
    }

    @PatchMapping("/me/{userId}/read-all")
    public ResponseData<Void> markAllAsRead(@PathVariable("userId") Long userId) {
        notificationService.markAllAsRead(userId);
        return new ResponseData<>(HttpStatus.OK.value(), "All marked as read");
    }
}
