package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Material;
import com.techbuildding.demoTechBuildding.repository.MaterialCategoryRepository;
import com.techbuildding.demoTechBuildding.repository.MaterialRepository;
import com.techbuildding.demoTechBuildding.repository.MaterialRequestRepository;
import com.techbuildding.demoTechBuildding.service.MaterialService;
import com.techbuildding.demoTechBuildding.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialCategoryRepository materialCategoryRepository;
    private final MaterialRequestRepository materialRequestRepository;


    @Override
    @CacheEvict(value = "materials", allEntries = true)
    public MaterialResponseDTO createMaterial(MaterialRequestDTO request) {
        Material material = Material.builder()
                .nameVi(request.getNameVi())
                .nameEn(request.getNameEn())
                .nameZh(request.getNameZh())
                .unit(request.getUnit())
                .imageUrl(request.getImageUrl())
                .catalogueUrl(request.getCatalogueUrl())
                .descriptionVi(request.getDescriptionVi())
                .descriptionEn(request.getDescriptionEn())
                .descriptionZh(request.getDescriptionZh())
                .managementCode(request.getManagementCode())
                .revitFamilyCategory(request.getRevitFamilyCategory())
                .revitCode(request.getRevitCode())
                .properties(request.getProperties())
                .build();
        
        if (request.getCategoryId() != null) {
            material.setCategory(materialCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId())));
        }

        
        Material saved = materialRepository.save(material);
        return mapToResponse(saved);
    }

    @Override
    @Cacheable("materials")
    public List<MaterialResponseDTO> getAllMaterials() {
        return materialRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaterialResponseDTO getMaterialById(Integer id) {
        Material m = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + id));
        return mapToResponse(m);
    }

    @Override
    @CacheEvict(value = "materials", allEntries = true)
    public MaterialResponseDTO updateMaterial(Integer id, MaterialRequestDTO request) {
        Material m = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + id));
        
        if (request.getNameVi() != null) m.setNameVi(request.getNameVi());
        if (request.getNameEn() != null) m.setNameEn(request.getNameEn());
        if (request.getNameZh() != null) m.setNameZh(request.getNameZh());
        if (request.getUnit() != null) m.setUnit(request.getUnit());
        if (request.getImageUrl() != null) m.setImageUrl(request.getImageUrl().isEmpty() ? null : request.getImageUrl());
        if (request.getCatalogueUrl() != null) m.setCatalogueUrl(request.getCatalogueUrl().isEmpty() ? null : request.getCatalogueUrl());
        if (request.getDescriptionVi() != null) m.setDescriptionVi(request.getDescriptionVi());
        if (request.getDescriptionEn() != null) m.setDescriptionEn(request.getDescriptionEn());
        if (request.getDescriptionZh() != null) m.setDescriptionZh(request.getDescriptionZh());
        if (request.getManagementCode() != null) m.setManagementCode(request.getManagementCode());
        if (request.getRevitCode() != null) m.setRevitCode(request.getRevitCode());
        if (request.getRevitFamilyCategory() != null) m.setRevitFamilyCategory(request.getRevitFamilyCategory());
        
        if (request.getCategoryId() != null) {
            m.setCategory(materialCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId())));
        }

        
        Material saved = materialRepository.save(m);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "materials", allEntries = true)
    public MaterialResponseDTO syncRevit(MaterialRequestDTO request) {
        Material material = materialRepository.findByRevitCode(request.getRevitCode())
                .orElse(new Material());
        
        if (request.getNameVi() != null) material.setNameVi(request.getNameVi());
        material.setUnit(request.getUnit());
        material.setRevitCode(request.getRevitCode());
        material.setRevitFamilyCategory(request.getRevitFamilyCategory());
        material.setProperties(request.getProperties());
        if (request.getDescriptionVi() != null) material.setDescriptionVi(request.getDescriptionVi());
        
        if (request.getCategoryId() != null) {
            material.setCategory(materialCategoryRepository.findById(request.getCategoryId())
                    .orElse(null));
        }
        
        Material saved = materialRepository.save(material);
        return mapToResponse(saved);
    }

    private MaterialResponseDTO mapToResponse(Material saved) {
        MaterialResponseDTO dto = new MaterialResponseDTO();
        dto.setId(saved.getId());
        dto.setNameVi(saved.getNameVi());
        dto.setNameEn(saved.getNameEn());
        dto.setNameZh(saved.getNameZh());
        dto.setUnit(saved.getUnit());
        dto.setImageUrl(saved.getImageUrl());
        dto.setCatalogueUrl(saved.getCatalogueUrl());
        dto.setDescriptionVi(saved.getDescriptionVi());
        dto.setDescriptionEn(saved.getDescriptionEn());
        dto.setDescriptionZh(saved.getDescriptionZh());
        dto.setManagementCode(saved.getManagementCode());
        if (saved.getCategory() != null) {
            dto.setCategoryId(saved.getCategory().getId());
            dto.setCategoryName(saved.getCategory().getName());
        }
        dto.setRevitFamilyCategory(saved.getRevitFamilyCategory());
        dto.setRevitCode(saved.getRevitCode());
        dto.setProperties(saved.getProperties());
        return dto;
    }


    @Override
    @CacheEvict(value = "materials", allEntries = true)
    public void deleteMaterial(Integer id) {
        if (!materialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Material not found: " + id);
        }
        
        // CHECK: Is it used in any material requests?
        if (materialRequestRepository.countByMaterialId(id) > 0) {
            throw new RuntimeException("Không thể xóa vật tư này vì nó đang được sử dụng trong các yêu cầu vật tư đang thực hiện.");
        }

        materialRepository.deleteById(id);
    }
}
