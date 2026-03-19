package com.techbuildding.demoTechBuildding.dto.response.notification;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private String targetUrl;
    private LocalDateTime createdAt;
}
