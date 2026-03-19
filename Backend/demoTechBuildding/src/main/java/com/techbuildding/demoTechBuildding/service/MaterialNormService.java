package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialNormRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialNormResponseDTO;
import java.util.List;

public interface MaterialNormService {
    MaterialNormResponseDTO createNorm(MaterialNormRequestDTO request);
    List<MaterialNormResponseDTO> getNormsByBoqItem(Integer boqItemId);
    void deleteNorm(Integer id);
}
