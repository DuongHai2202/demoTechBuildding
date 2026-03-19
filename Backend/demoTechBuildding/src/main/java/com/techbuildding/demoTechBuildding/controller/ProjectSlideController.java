package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.project.ProjectSlideRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.project.ProjectSlideResponseDTO;
import com.techbuildding.demoTechBuildding.service.ProjectSlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/slides")
@RequiredArgsConstructor
public class ProjectSlideController {

    private final ProjectSlideService slideService;

    @PostMapping
    public ResponseData<ProjectSlideResponseDTO> addSlide(@PathVariable("projectId") Integer projectId, @RequestBody ProjectSlideRequestDTO request) {
        request.setProjectId(projectId);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", slideService.addSlide(request));
    }

    @GetMapping
    public ResponseData<List<ProjectSlideResponseDTO>> getSlidesByProject(@PathVariable("projectId") Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", slideService.getSlidesByProject(projectId));
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteSlide(@PathVariable("id") Integer id) {
        slideService.deleteSlide(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted");
    }
}
