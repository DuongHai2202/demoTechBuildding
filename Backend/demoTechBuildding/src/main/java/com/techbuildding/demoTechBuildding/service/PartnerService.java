package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.partner.PartnerRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.partner.PartnerResponseDTO;

import java.util.List;

public interface PartnerService {
    PartnerResponseDTO createPartner(PartnerRequestDTO request);
    List<PartnerResponseDTO> getAllPartners();
    PartnerResponseDTO getPartnerById(Integer id);
    PartnerResponseDTO updatePartner(Integer id, PartnerRequestDTO request);
    void deletePartner(Integer id);
}
