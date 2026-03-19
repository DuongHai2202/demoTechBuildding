package com.techbuildding.demoTechBuildding.dto.response.material;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class MaterialRequestResponseDTO implements Serializable {
    private Integer id;
    private Integer projectId;
    private String projectName;
    private Long requesterId;
    private String requesterName;
    private Integer materialId;
    private String materialName;
    private String materialUnit;
    private Float requestedQuantity;
    private String status;
    private Long checkedBy;
    private String checkedByName;
    private Long approvedBy;
    private String approvedByName;
    private LocalDateTime checkedAt;
    private LocalDateTime approvedAt;
    private String notes;
    private LocalDateTime createdAt;
}
