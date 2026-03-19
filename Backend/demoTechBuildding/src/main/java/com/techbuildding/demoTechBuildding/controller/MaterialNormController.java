package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialNormRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialNormResponseDTO;
import com.techbuildding.demoTechBuildding.service.MaterialNormService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/material-norms")
@RequiredArgsConstructor
@Tag(name = "Material norm controller", description = "Management of material norms for BOQ items")
public class MaterialNormController {

    private final MaterialNormService materialNormService;

    @Operation(summary = "Create or update material norm")
    @PostMapping
    public ResponseData<MaterialNormResponseDTO> create(@RequestBody MaterialNormRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", materialNormService.createNorm(request));
    }

    @Operation(summary = "Get norms by BOQ item")
    @GetMapping("/boq-item/{boqItemId}")
    public ResponseData<List<MaterialNormResponseDTO>> getByBoqItem(@PathVariable("boqItemId") Integer boqItemId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", materialNormService.getNormsByBoqItem(boqItemId));
    }

    @Operation(summary = "Delete material norm")
    @DeleteMapping("/{id}")
    public ResponseData<Void> delete(@PathVariable("id") Integer id) {
        materialNormService.deleteNorm(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted", null);
    }
}
