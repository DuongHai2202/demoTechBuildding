package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.notification.NotificationResponseDTO;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.exception.ResourceNotFoundException;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseData<List<NotificationResponseDTO>> getMyNotifications(Authentication authentication) {
        Long userId = currentUserId(authentication);
        return new ResponseData<>(HttpStatus.OK.value(), "Success", notificationService.getMyNotifications(userId));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseData<Void> markAsRead(@PathVariable("id") Long id, Authentication authentication) {
        notificationService.markAsRead(currentUserId(authentication), id);
        return new ResponseData<>(HttpStatus.OK.value(), "Marked as read");
    }

    @PatchMapping("/me/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseData<Void> markAllAsRead(Authentication authentication) {
        Long userId = currentUserId(authentication);
        notificationService.markAllAsRead(userId);
        return new ResponseData<>(HttpStatus.OK.value(), "All marked as read");
    }

    private Long currentUserId(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản hiện tại."));
        return user.getId();
    }
}
