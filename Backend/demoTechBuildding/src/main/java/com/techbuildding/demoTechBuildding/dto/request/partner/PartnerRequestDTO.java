package com.techbuildding.demoTechBuildding.dto.request.partner;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PartnerRequestDTO {
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
}
