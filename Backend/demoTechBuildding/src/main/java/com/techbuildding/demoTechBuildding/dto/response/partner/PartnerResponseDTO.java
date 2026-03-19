package com.techbuildding.demoTechBuildding.dto.response.partner;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PartnerResponseDTO {
    private Integer id;
    private String name;
    private String partnerCode;
    private String taxCode;
    private String status;
    private String type;
    private String address;
    private String contactPerson;
    private String phone;
    private String email;
    private String capacityProfile;
    private java.util.Map<String, Object> unitPrices;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
