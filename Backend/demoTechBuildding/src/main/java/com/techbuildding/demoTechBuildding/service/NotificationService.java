package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.response.notification.NotificationResponseDTO;
import java.util.List;

public interface NotificationService {
    void sendNotification(Long userId, String title, String message, String type, String targetUrl);
    List<NotificationResponseDTO> getMyNotifications(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
