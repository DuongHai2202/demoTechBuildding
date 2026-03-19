package com.techbuildding.demoTechBuildding.dto.response.contract;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BoqItemResponseDTO {
    private Integer id;
    private Integer contractId;
    private String itemCode;
    private String description;
    private String unit;
    private Float quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
    private BigDecimal totalWithVat;
    private Integer parentId;
    private String parentCode;
    private String bimId;
}
