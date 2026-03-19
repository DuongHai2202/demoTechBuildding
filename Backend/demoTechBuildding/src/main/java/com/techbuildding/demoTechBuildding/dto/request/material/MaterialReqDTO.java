package com.techbuildding.demoTechBuildding.dto.request.material;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Schema(description = "Request DTO for material request")
public class MaterialReqDTO implements Serializable {
    @NotNull(message = "Project ID is required")
    private Integer projectId;

    @NotNull(message = "Requester ID is required")
    private Long requesterId;

    @NotNull(message = "Material ID is required")
    private Integer materialId;

    @NotNull(message = "Quantity is required")
    private Float requestedQuantity;

    private String status;
    private Long checkedBy;
    private Long approvedBy;
    private java.time.LocalDateTime checkedAt;
    private java.time.LocalDateTime approvedAt;
    private String notes;
}
