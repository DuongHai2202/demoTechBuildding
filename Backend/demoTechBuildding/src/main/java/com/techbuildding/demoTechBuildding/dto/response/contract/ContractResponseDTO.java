package com.techbuildding.demoTechBuildding.dto.response.contract;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ContractResponseDTO implements Serializable {
    private Integer id;
    private Integer projectId;
    private String projectName;
    private String contractNumber;
    private String contractName;
    private String partnerName;
    private Integer partnerId;
    private BigDecimal contractValue;
    private Integer workflowStep;
    private String guaranteeInfo;
    private String status;
    private String fileUrl;
    private String type;
    private Integer parentId;
    private LocalDate signedDate;
    private LocalDate startDate;
    private LocalDate endDate;
}
