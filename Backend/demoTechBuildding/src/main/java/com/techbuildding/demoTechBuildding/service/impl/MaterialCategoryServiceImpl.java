package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.response.material.MaterialCategoryResponseDTO;
import com.techbuildding.demoTechBuildding.entity.MaterialCategory;
import com.techbuildding.demoTechBuildding.repository.MaterialCategoryRepository;
import com.techbuildding.demoTechBuildding.service.MaterialCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialCategoryServiceImpl implements MaterialCategoryService {

    private final MaterialCategoryRepository categoryRepository;

    @Override
    @Cacheable("materialCategories")
    public List<MaterialCategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MaterialCategoryResponseDTO mapToResponse(MaterialCategory category) {
        MaterialCategoryResponseDTO dto = new MaterialCategoryResponseDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        return dto;
    }
}
