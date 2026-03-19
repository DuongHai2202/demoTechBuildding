package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.contract.DrawingRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.contract.DrawingResponseDTO;
import com.techbuildding.demoTechBuildding.service.DrawingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/drawings")
@RequiredArgsConstructor
public class DrawingController {

    private final DrawingService drawingService;

    @PostMapping
    public ResponseData<DrawingResponseDTO> createDrawing(@RequestBody DrawingRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", drawingService.createDrawing(request));
    }

    @GetMapping("/project/{projectId}")
    public ResponseData<List<DrawingResponseDTO>> getDrawingsByProject(@PathVariable("projectId") Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", drawingService.getDrawingsByProject(projectId));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseData<List<DrawingResponseDTO>> getDrawingsByContract(@PathVariable("contractId") Integer contractId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", drawingService.getDrawingsByContract(contractId));
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteDrawing(@PathVariable("id") Integer id) {
        drawingService.deleteDrawing(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted");
    }
}
