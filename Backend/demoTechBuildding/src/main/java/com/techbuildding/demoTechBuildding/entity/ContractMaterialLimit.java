package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_contract_material_limits")
public class ContractMaterialLimit extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "limit_quantity", nullable = false)
    private Float limitQuantity;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 30)
    private MaterialLimitType type = MaterialLimitType.CONTRACTOR_SUPPLIED;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum MaterialLimitType {
        OWNER_SUPPLIED,      // Vật tư A cấp
        CONTRACTOR_SUPPLIED  // Vật tư giao khoán
    }
}
