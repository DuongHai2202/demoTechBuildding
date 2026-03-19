package com.techbuildding.demoTechBuildding.mapper;

import com.techbuildding.demoTechBuildding.dto.request.bim.BimModelRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.bim.BimModelResponseDTO;
import com.techbuildding.demoTechBuildding.entity.BimModel;
import org.springframework.stereotype.Component;

@Component
public class BimModelMapper {

    public BimModel toEntity(BimModelRequestDTO request) {
        return BimModel.builder()
                .modelName(request.getModelName())
                .fileUrl(request.getFileUrl())
                .version(request.getVersion())
                .description(request.getDescription())
                .fileSize(request.getFileSize())
                .build();
    }

    public BimModelResponseDTO toResponseDTO(BimModel entity) {
        return BimModelResponseDTO.builder()
                .id(entity.getId())
                .projectId(entity.getProject().getId())
                .zoneId(entity.getZone() != null ? entity.getZone().getId() : null)
                .zoneName(entity.getZone() != null ? entity.getZone().getName() : "Toàn bộ dự án")
                .modelName(entity.getModelName())
                .fileUrl(entity.getFileUrl())
                .version(entity.getVersion())
                .description(entity.getDescription())
                .fileSize(entity.getFileSize())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntity(BimModel entity, BimModelRequestDTO request) {
        entity.setModelName(request.getModelName());
        entity.setVersion(request.getVersion());
        entity.setDescription(request.getDescription());
        if (request.getFileUrl() != null) {
            entity.setFileUrl(request.getFileUrl());
        }
        if (request.getFileSize() != null) {
            entity.setFileSize(request.getFileSize());
        }
    }
}
