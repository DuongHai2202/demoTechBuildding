package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.partner.PartnerRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.partner.PartnerResponseDTO;
import com.techbuildding.demoTechBuildding.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final PartnerService partnerService;

    @PostMapping
    public ResponseData<PartnerResponseDTO> createPartner(@RequestBody PartnerRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", partnerService.createPartner(request));
    }

    @GetMapping
    public ResponseData<List<PartnerResponseDTO>> getAllPartners() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", partnerService.getAllPartners());
    }

    @GetMapping("/{id}")
    public ResponseData<PartnerResponseDTO> getPartnerById(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", partnerService.getPartnerById(id));
    }

    @PutMapping("/{id}")
    public ResponseData<PartnerResponseDTO> updatePartner(@PathVariable("id") Integer id, @RequestBody PartnerRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Updated", partnerService.updatePartner(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> deletePartner(@PathVariable("id") Integer id) {
        partnerService.deletePartner(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted");
    }
}
