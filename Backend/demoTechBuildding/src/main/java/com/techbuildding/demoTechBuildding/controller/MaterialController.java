package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialResponseDTO;
import com.techbuildding.demoTechBuildding.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
@Tag(name = "Material controller", description = "Material catalog management")
public class MaterialController {

    private final MaterialService materialService;

    @Operation(summary = "Get all materials")
    @GetMapping
    public ResponseData<List<MaterialResponseDTO>> getAll() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", materialService.getAllMaterials());
    }

    @Operation(summary = "Get material by id")
    @GetMapping("/{id}")
    public ResponseData<MaterialResponseDTO> getById(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", materialService.getMaterialById(id));
    }

    @Operation(summary = "Create new material")
    @PostMapping
    public ResponseData<MaterialResponseDTO> create(@RequestBody MaterialRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", materialService.createMaterial(request));
    }

    @Operation(summary = "Sync materials from Revit")
    @PostMapping("/sync-revit")
    public ResponseData<MaterialResponseDTO> syncRevit(@RequestBody MaterialRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Synced", materialService.syncRevit(request));
    }

    @Operation(summary = "Update material by id")
    @PutMapping("/{id}")
    public ResponseData<MaterialResponseDTO> update(@PathVariable("id") Integer id, @RequestBody MaterialRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Updated", materialService.updateMaterial(id, request));
    }

    @Operation(summary = "Delete material by id")
    @DeleteMapping("/{id}")
    public ResponseData<Void> delete(@PathVariable("id") Integer id) {
        materialService.deleteMaterial(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted", null);
    }
}
