package com.techbuildding.demoTechBuildding.dto.request.contract;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractMaterialLimitRequestDTO {
    private Integer contractId;
    private Integer materialId;
    private Float limitQuantity;
    private String type;
    private String notes;
}
