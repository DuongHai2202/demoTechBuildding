package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.bim.BimModelRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.bim.BimModelResponseDTO;

import java.util.List;

public interface BimModelService {
    BimModelResponseDTO createModel(BimModelRequestDTO request);
    List<BimModelResponseDTO> getModelsByProject(Integer projectId, Integer zoneId);
    BimModelResponseDTO updateModel(Integer id, BimModelRequestDTO request);
    void deleteModel(Integer id);
}
