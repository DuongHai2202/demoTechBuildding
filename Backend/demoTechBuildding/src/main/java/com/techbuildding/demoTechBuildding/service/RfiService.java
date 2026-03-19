package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.design.RfiCommentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.design.RfiRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.design.RfiCommentResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.design.RfiResponseDTO;

import java.util.List;

public interface RfiService {
    RfiResponseDTO createRfi(RfiRequestDTO request);
    List<RfiResponseDTO> getRfisByProject(Integer projectId, Integer zoneId);
    RfiResponseDTO getRfiById(Integer id);
    RfiResponseDTO updateRfiStatus(Integer id, String status);
    
    RfiCommentResponseDTO addComment(RfiCommentRequestDTO request);
    List<RfiCommentResponseDTO> getCommentsByRfi(Integer rfiId);
}
