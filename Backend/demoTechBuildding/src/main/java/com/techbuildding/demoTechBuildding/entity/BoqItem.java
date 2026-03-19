package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_boq_items")
public class BoqItem extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "item_code", length = 50)
    private String itemCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "quantity")
    private Float quantity;

    @Column(name = "unit_price", precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 18, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "vat_rate", precision = 5, scale = 2)
    private BigDecimal vatRate;

    @Column(name = "vat_amount", precision = 18, scale = 2)
    private BigDecimal vatAmount;

    @Column(name = "total_with_vat", precision = 18, scale = 2)
    private BigDecimal totalWithVat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private BoqItem parentItem;

    @Column(name = "bim_id", length = 100)
    private String bimId;
}
