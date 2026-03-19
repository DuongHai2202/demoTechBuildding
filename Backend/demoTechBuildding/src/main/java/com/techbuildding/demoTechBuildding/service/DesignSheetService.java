package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.design.DesignSheetRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.design.DesignSheetResponseDTO;

import java.util.List;

public interface DesignSheetService {
    DesignSheetResponseDTO addSheet(DesignSheetRequestDTO request);
    List<DesignSheetResponseDTO> getSheetsByProject(Integer projectId, Integer zoneId);
    DesignSheetResponseDTO updateSheet(Integer id, DesignSheetRequestDTO request);
    void deleteSheet(Integer id);
}
