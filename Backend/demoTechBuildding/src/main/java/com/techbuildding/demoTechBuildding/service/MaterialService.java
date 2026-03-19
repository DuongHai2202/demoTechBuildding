package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialResponseDTO;
import java.util.List;

public interface MaterialService {
    MaterialResponseDTO createMaterial(MaterialRequestDTO request);

    List<MaterialResponseDTO> getAllMaterials();

    MaterialResponseDTO getMaterialById(Integer id);

    MaterialResponseDTO updateMaterial(Integer id, MaterialRequestDTO request);

    MaterialResponseDTO syncRevit(MaterialRequestDTO request);

    void deleteMaterial(Integer id);
}
