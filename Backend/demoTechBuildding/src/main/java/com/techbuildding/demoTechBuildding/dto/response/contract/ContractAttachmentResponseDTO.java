package com.techbuildding.demoTechBuildding.dto.response.contract;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ContractAttachmentResponseDTO {
    private Integer id;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private Long uploadedBy;
    private String uploaderName;
    private LocalDateTime createdAt;
}
