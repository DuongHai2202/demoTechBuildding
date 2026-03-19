package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.project.ZoneRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ZoneResponseDTO;

import java.util.List;

public interface ZoneService {
    ZoneResponseDTO createZone(ZoneRequestDTO request);
    List<ZoneResponseDTO> getZonesByProject(Integer projectId);
    void deleteZone(Integer id);
}
