package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.partner.PartnerRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.partner.PartnerResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Partner;
import com.techbuildding.demoTechBuildding.repository.PartnerRepository;
import com.techbuildding.demoTechBuildding.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartnerServiceImpl implements PartnerService {

    private final PartnerRepository partnerRepository;

    @Override
    public PartnerResponseDTO createPartner(PartnerRequestDTO request) {
        Partner p = Partner.builder()
                .name(request.getName())
                .partnerCode(request.getPartnerCode())
                .taxCode(request.getTaxCode())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .email(request.getEmail())
                .capacityProfile(request.getCapacityProfile())
                .unitPrices(request.getUnitPrices())
                .status(request.getStatus())
                .type(request.getType())
                .build();
        Partner saved = partnerRepository.save(p);
        return mapToResponse(saved);
    }

    @Override
    public List<PartnerResponseDTO> getAllPartners() {
        return partnerRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public PartnerResponseDTO getPartnerById(Integer id) {
        return partnerRepository.findById(id).map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Partner not found: " + id));
    }

    @Override
    public PartnerResponseDTO updatePartner(Integer id, PartnerRequestDTO request) {
        Partner p = partnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found: " + id));
        p.setName(request.getName());
        p.setPartnerCode(request.getPartnerCode());
        p.setTaxCode(request.getTaxCode());
        p.setAddress(request.getAddress());
        p.setContactPerson(request.getContactPerson());
        p.setPhone(request.getPhone());
        p.setEmail(request.getEmail());
        p.setCapacityProfile(request.getCapacityProfile());
        p.setUnitPrices(request.getUnitPrices());
        p.setStatus(request.getStatus());
        p.setType(request.getType());
        return mapToResponse(partnerRepository.save(p));
    }

    @Override
    public void deletePartner(Integer id) {
        partnerRepository.deleteById(id);
    }

    private PartnerResponseDTO mapToResponse(Partner p) {
        PartnerResponseDTO dto = new PartnerResponseDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setPartnerCode(p.getPartnerCode());
        dto.setTaxCode(p.getTaxCode());
        dto.setAddress(p.getAddress());
        dto.setContactPerson(p.getContactPerson());
        dto.setPhone(p.getPhone());
        dto.setEmail(p.getEmail());
        dto.setCapacityProfile(p.getCapacityProfile());
        dto.setUnitPrices(p.getUnitPrices());
        dto.setStatus(p.getStatus());
        dto.setType(p.getType());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}
