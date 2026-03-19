package com.techbuildding.demoTechBuildding.dto.request.contract;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BoqItemRequestDTO {
    private Integer contractId;
    private String itemCode;
    private String description;
    private String unit;
    private Float quantity;
    private BigDecimal unitPrice;
    private BigDecimal vatRate;
    private Integer parentId;
    private String bimId;
}
