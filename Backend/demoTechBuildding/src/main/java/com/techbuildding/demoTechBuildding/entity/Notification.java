package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_notifications")
public class Notification extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "type", length = 50)
    private String type; // INFO, WARNING, SUCCESS, DANGER

    @Builder.Default
    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "target_url")
    private String targetUrl;
}
