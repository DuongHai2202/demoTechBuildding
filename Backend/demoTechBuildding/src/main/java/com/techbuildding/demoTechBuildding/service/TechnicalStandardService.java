package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.technical.TechnicalStandardRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.technical.TechnicalStandardResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TechnicalStandardService {
    TechnicalStandardResponseDTO createStandard(TechnicalStandardRequestDTO request);
    TechnicalStandardResponseDTO updateStandard(Long id, TechnicalStandardRequestDTO request);
    TechnicalStandardResponseDTO uploadFile(Long id, MultipartFile file);
    List<TechnicalStandardResponseDTO> getStandardsByProject(Integer projectId);
    List<TechnicalStandardResponseDTO> getAllStandards();
    void deleteStandard(Long id);
}
