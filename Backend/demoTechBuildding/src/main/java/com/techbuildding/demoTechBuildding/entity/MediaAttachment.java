package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_media_attachments")
public class MediaAttachment extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_id", nullable = false)
    private WorkLog workLog;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "file_type", length = 20)
    private String fileType;
}
