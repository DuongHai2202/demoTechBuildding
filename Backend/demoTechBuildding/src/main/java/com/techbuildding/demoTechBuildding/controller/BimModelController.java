package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.bim.BimModelRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.bim.BimModelResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.service.BimModelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bim-models")
@RequiredArgsConstructor
@Tag(name = "BIM Model Controller", description = "APIs for Revit (BIM) model management")
public class BimModelController {

    private final BimModelService bimModelService;

    @Operation(summary = "Create a new BIM model", description = "Link a Revit file URL to a project/zone")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<BimModelResponseDTO> createModel(@RequestBody BimModelRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "BIM model created successfully", bimModelService.createModel(request));
    }

    @Operation(summary = "Get BIM models", description = "Retrieve all BIM models for a project, optionally filtered by zone")
    @GetMapping("/project/{projectId}")
    public ResponseData<List<BimModelResponseDTO>> getModels(
            @PathVariable Integer projectId,
            @RequestParam(required = false) Integer zoneId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", bimModelService.getModelsByProject(projectId, zoneId));
    }

    @Operation(summary = "Update BIM model metadata", description = "Update the name, version, or description of a BIM model")
    @PutMapping("/{id}")
    public ResponseData<BimModelResponseDTO> updateModel(@PathVariable Integer id, @RequestBody BimModelRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "BIM model updated successfully", bimModelService.updateModel(id, request));
    }

    @Operation(summary = "Delete BIM model", description = "Remove a BIM model record")
    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteModel(@PathVariable Integer id) {
        bimModelService.deleteModel(id);
        return new ResponseData<>(HttpStatus.OK.value(), "BIM model deleted successfully");
    }
}
