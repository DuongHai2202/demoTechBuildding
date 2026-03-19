package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_partners")
public class Partner extends AbstractEntity<Integer> {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "partner_code", unique = true, length = 50)
    private String partnerCode;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "type", length = 50)
    private String type; // e.g., "Main Contractor", "Subcontractor", "Client"

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "capacity_profile", columnDefinition = "TEXT")
    private String capacityProfile;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "unit_prices_json")
    private Map<String, Object> unitPrices;
}
