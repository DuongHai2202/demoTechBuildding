package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialNormRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialNormResponseDTO;
import com.techbuildding.demoTechBuildding.entity.BoqItem;
import com.techbuildding.demoTechBuildding.entity.Material;
import com.techbuildding.demoTechBuildding.entity.MaterialNorm;
import com.techbuildding.demoTechBuildding.repository.BoqItemRepository;
import com.techbuildding.demoTechBuildding.repository.MaterialNormRepository;
import com.techbuildding.demoTechBuildding.repository.MaterialRepository;
import com.techbuildding.demoTechBuildding.service.MaterialNormService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialNormServiceImpl implements MaterialNormService {

    private final MaterialNormRepository materialNormRepository;
    private final BoqItemRepository boqItemRepository;
    private final MaterialRepository materialRepository;

    @Override
    @Transactional
    public MaterialNormResponseDTO createNorm(MaterialNormRequestDTO request) {
        BoqItem boqItem = boqItemRepository.findById(request.getBoqItemId())
                .orElseThrow(() -> new RuntimeException("BOQ Item not found"));
        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new RuntimeException("Material not found"));

        MaterialNorm norm = MaterialNorm.builder()
                .boqItem(boqItem)
                .material(material)
                .quantityPerUnit(request.getQuantityPerUnit())
                .build();

        MaterialNorm saved = materialNormRepository.save(norm);
        return mapToResponse(saved);
    }

    @Override
    public List<MaterialNormResponseDTO> getNormsByBoqItem(Integer boqItemId) {
        return materialNormRepository.findByBoqItemId(boqItemId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteNorm(Integer id) {
        materialNormRepository.deleteById(id);
    }

    private MaterialNormResponseDTO mapToResponse(MaterialNorm norm) {
        MaterialNormResponseDTO dto = new MaterialNormResponseDTO();
        dto.setId(norm.getId());
        dto.setBoqItemId(norm.getBoqItem().getId());
        dto.setMaterialId(norm.getMaterial().getId());
        dto.setMaterialName(norm.getMaterial().getNameVi());
        dto.setMaterialUnit(norm.getMaterial().getUnit());
        dto.setQuantityPerUnit(norm.getQuantityPerUnit());
        return dto;
    }
}
