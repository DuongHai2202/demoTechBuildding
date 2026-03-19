package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.design.DesignSheetRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.design.DesignSheetResponseDTO;
import com.techbuildding.demoTechBuildding.entity.DesignSheet;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.entity.Zone;
import com.techbuildding.demoTechBuildding.repository.DesignSheetRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.repository.ZoneRepository;
import com.techbuildding.demoTechBuildding.service.DesignSheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DesignSheetServiceImpl implements DesignSheetService {

    private final DesignSheetRepository designSheetRepository;
    private final ProjectRepository projectRepository;
    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DesignSheetResponseDTO addSheet(DesignSheetRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        Zone zone = null;
        if (request.getZoneId() != null) {
            zone = zoneRepository.findById(request.getZoneId())
                    .orElseThrow(() -> new RuntimeException("Zone not found: " + request.getZoneId()));
        }

        User issuer = null;
        if (request.getIssuedBy() != null) {
            issuer = userRepository.findById(request.getIssuedBy())
                    .orElseThrow(() -> new RuntimeException("User not found: " + request.getIssuedBy()));
        }

        DesignSheet sheet = DesignSheet.builder()
                .project(project)
                .zone(zone)
                .sheetNumber(request.getSheetNumber())
                .title(request.getTitle())
                .discipline(request.getDiscipline())
                .revision(request.getRevision())
                .status(request.getStatus())
                .fileUrl(request.getFileUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .issuedAt(request.getIssuedAt())
                .issuer(issuer)
                .build();

        sheet = designSheetRepository.save(sheet);
        return mapToResponseDTO(sheet);
    }

    @Override
    public List<DesignSheetResponseDTO> getSheetsByProject(Integer projectId, Integer zoneId) {
        List<DesignSheet> sheets;
        if (zoneId != null) {
            sheets = designSheetRepository.findByProjectIdAndZoneId(projectId, zoneId);
        } else {
            sheets = designSheetRepository.findByProjectId(projectId);
        }
        return sheets.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DesignSheetResponseDTO updateSheet(Integer id, DesignSheetRequestDTO request) {
        DesignSheet sheet = designSheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Design sheet not found: " + id));

        if (request.getZoneId() != null) {
            Zone zone = zoneRepository.findById(request.getZoneId())
                    .orElseThrow(() -> new RuntimeException("Zone not found: " + request.getZoneId()));
            sheet.setZone(zone);
        }

        if (request.getIssuedBy() != null) {
            User issuer = userRepository.findById(request.getIssuedBy())
                    .orElseThrow(() -> new RuntimeException("User not found: " + request.getIssuedBy()));
            sheet.setIssuer(issuer);
        }

        sheet.setSheetNumber(request.getSheetNumber());
        sheet.setTitle(request.getTitle());
        sheet.setDiscipline(request.getDiscipline());
        sheet.setRevision(request.getRevision());
        sheet.setStatus(request.getStatus());
        sheet.setFileUrl(request.getFileUrl());
        sheet.setThumbnailUrl(request.getThumbnailUrl());
        sheet.setIssuedAt(request.getIssuedAt());

        sheet = designSheetRepository.save(sheet);
        return mapToResponseDTO(sheet);
    }

    @Override
    @Transactional
    public void deleteSheet(Integer id) {
        designSheetRepository.deleteById(id);
    }

    private DesignSheetResponseDTO mapToResponseDTO(DesignSheet sheet) {
        return DesignSheetResponseDTO.builder()
                .id(sheet.getId())
                .projectId(sheet.getProject().getId())
                .zoneId(sheet.getZone() != null ? sheet.getZone().getId() : null)
                .zoneName(sheet.getZone() != null ? sheet.getZone().getName() : null)
                .sheetNumber(sheet.getSheetNumber())
                .title(sheet.getTitle())
                .discipline(sheet.getDiscipline())
                .revision(sheet.getRevision())
                .status(sheet.getStatus())
                .fileUrl(sheet.getFileUrl())
                .thumbnailUrl(sheet.getThumbnailUrl())
                .issuedAt(sheet.getIssuedAt())
                .issuedBy(sheet.getIssuer() != null ? sheet.getIssuer().getId() : null)
                .issuerName(sheet.getIssuer() != null ? sheet.getIssuer().getFullName() : null)
                .createdAt(sheet.getCreatedAt())
                .updatedAt(sheet.getUpdatedAt())
                .build();
    }
}
