package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.project.ZoneRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.project.ZoneResponseDTO;
import com.techbuildding.demoTechBuildding.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/zones")
@RequiredArgsConstructor
public class ZoneController {

    private final ZoneService zoneService;

    @PostMapping
    public ResponseData<ZoneResponseDTO> createZone(@PathVariable("projectId") Integer projectId, @RequestBody ZoneRequestDTO request) {
        request.setProjectId(projectId);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", zoneService.createZone(request));
    }

    @GetMapping
    public ResponseData<List<ZoneResponseDTO>> getZonesByProject(@PathVariable("projectId") Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", zoneService.getZonesByProject(projectId));
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteZone(@PathVariable("id") Integer id) {
        zoneService.deleteZone(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted");
    }
}
