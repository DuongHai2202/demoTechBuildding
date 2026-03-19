package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.project.ProjectSlideRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectSlideResponseDTO;

import java.util.List;

public interface ProjectSlideService {
    ProjectSlideResponseDTO addSlide(ProjectSlideRequestDTO request);
    List<ProjectSlideResponseDTO> getSlidesByProject(Integer projectId);
    void deleteSlide(Integer id);
}
