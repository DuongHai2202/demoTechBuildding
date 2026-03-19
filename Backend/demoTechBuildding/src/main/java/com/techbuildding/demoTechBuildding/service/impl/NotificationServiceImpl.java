package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.response.notification.NotificationResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Notification;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.repository.NotificationRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void sendNotification(Long userId, String title, String message, String type, String targetUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Recipient user not found: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .targetUrl(targetUrl)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponseDTO> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponseDTO mapToDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.getIsRead())
                .targetUrl(n.getTargetUrl())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
