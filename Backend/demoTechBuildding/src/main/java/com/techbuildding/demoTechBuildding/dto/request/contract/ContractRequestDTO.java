package com.techbuildding.demoTechBuildding.dto.request.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Schema(description = "Request DTO for creating a contract")
public class ContractRequestDTO implements Serializable {

    @NotNull(message = "Project ID is required")
    private Integer projectId;

    private String contractNumber;

    private String contractName;
    private Integer partnerId;
    private String partnerName;
    private BigDecimal contractValue;
    private Integer workflowStep;
    private String guaranteeInfo;
    private String status;
    private String type;
    private Integer parentId;
    private LocalDate signedDate;
    private LocalDate startDate;
    private LocalDate endDate;
}
