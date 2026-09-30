package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.project.ZoneRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.project.ZoneResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.Zone;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.ZoneRepository;
import com.techbuildding.demoTechBuildding.service.ZoneService;
import com.techbuildding.demoTechBuildding.exception.DuplicateResourceException;
import com.techbuildding.demoTechBuildding.util.code.StandardCodeGenerator;
import com.techbuildding.demoTechBuildding.util.code.StandardCodeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository zoneRepository;
    private final ProjectRepository projectRepository;
    private final StandardCodeGenerator codeGenerator;

    @Override
    public ZoneResponseDTO createZone(ZoneRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));
        
        Zone parent = null;
        if (request.getParentId() != null) {
            parent = zoneRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent zone not found: " + request.getParentId()));
        }

        String zoneCode = codeGenerator.cleanProvidedCode(request.getZoneCode());
        if (zoneCode == null) {
            zoneCode = codeGenerator.next(StandardCodeType.ZONE, zoneRepository::existsByZoneCode);
        } else if (zoneRepository.existsByZoneCode(zoneCode)) {
            throw new DuplicateResourceException("Mã khu vực '" + zoneCode + "' đã tồn tại.");
        }

        Zone zone = Zone.builder()
                .project(project)
                .name(request.getName())
                .zoneCode(zoneCode)
                .parent(parent)
                .build();
        
        Zone saved = zoneRepository.save(zone);
        return mapToResponse(saved);
    }

    @Override
    public List<ZoneResponseDTO> getZonesByProject(Integer projectId) {
        // Return only root zones with their children nested
        return zoneRepository.findByProjectIdAndParentIsNull(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteZone(Integer id) {
        zoneRepository.deleteById(id);
    }

    private ZoneResponseDTO mapToResponse(Zone z) {
        ZoneResponseDTO dto = new ZoneResponseDTO();
        dto.setId(z.getId());
        dto.setProjectId(z.getProject().getId());
        dto.setName(z.getName());
        dto.setZoneCode(z.getZoneCode());
        dto.setParentId(z.getParent() != null ? z.getParent().getId() : null);
        
        if (z.getChildren() != null && !z.getChildren().isEmpty()) {
            dto.setChildren(z.getChildren().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}
