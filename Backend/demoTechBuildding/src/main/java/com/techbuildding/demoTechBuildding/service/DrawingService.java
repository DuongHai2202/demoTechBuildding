package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.contract.DrawingRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.DrawingResponseDTO;

import java.util.List;

public interface DrawingService {
    DrawingResponseDTO createDrawing(DrawingRequestDTO request);
    List<DrawingResponseDTO> getDrawingsByProject(Integer projectId);
    List<DrawingResponseDTO> getDrawingsByContract(Integer contractId);
    void deleteDrawing(Integer id);
}
