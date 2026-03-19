package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialCategoryResponseDTO;
import com.techbuildding.demoTechBuildding.service.MaterialCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/material-categories")
@RequiredArgsConstructor
@Tag(name = "Material Categories", description = "Material Category management APIs")
public class MaterialCategoryController {

    private final MaterialCategoryService categoryService;

    @Operation(summary = "Get all material categories")
    @GetMapping
    public ResponseData<List<MaterialCategoryResponseDTO>> getAllCategories() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", categoryService.getAllCategories());
    }
}
