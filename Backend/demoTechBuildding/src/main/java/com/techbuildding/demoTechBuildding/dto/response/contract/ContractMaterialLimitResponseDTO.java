package com.techbuildding.demoTechBuildding.dto.response.contract;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractMaterialLimitResponseDTO {
    private Integer id;
    private Integer contractId;
    private Integer materialId;
    private String materialName;
    private String materialUnit;
    private Float limitQuantity;
    private String type;
    private String notes;
}
