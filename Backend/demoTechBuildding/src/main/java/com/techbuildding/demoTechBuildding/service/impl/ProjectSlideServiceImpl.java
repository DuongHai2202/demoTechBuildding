package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.project.ProjectSlideRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectSlideResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.ProjectSlide;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectSlideRepository;
import com.techbuildding.demoTechBuildding.service.ProjectSlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectSlideServiceImpl implements ProjectSlideService {

    private final ProjectSlideRepository slideRepository;
    private final ProjectRepository projectRepository;

    @Override
    public ProjectSlideResponseDTO addSlide(ProjectSlideRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        ProjectSlide slide = ProjectSlide.builder()
                .project(project)
                .imageUrl(request.getImageUrl())
                .caption(request.getCaption())
                .displayOrder(request.getDisplayOrder())
                .build();

        return mapToResponse(slideRepository.save(slide));
    }

    @Override
    public List<ProjectSlideResponseDTO> getSlidesByProject(Integer projectId) {
        return slideRepository.findByProjectIdOrderByDisplayOrderAsc(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteSlide(Integer id) {
        slideRepository.deleteById(id);
    }

    private ProjectSlideResponseDTO mapToResponse(ProjectSlide s) {
        ProjectSlideResponseDTO dto = new ProjectSlideResponseDTO();
        dto.setId(s.getId());
        dto.setProjectId(s.getProject().getId());
        dto.setImageUrl(s.getImageUrl());
        dto.setCaption(s.getCaption());
        dto.setDisplayOrder(s.getDisplayOrder());
        return dto;
    }
}
