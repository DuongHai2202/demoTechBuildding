package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.response.material.MaterialCategoryResponseDTO;

import java.util.List;

public interface MaterialCategoryService {
    List<MaterialCategoryResponseDTO> getAllCategories();
}
