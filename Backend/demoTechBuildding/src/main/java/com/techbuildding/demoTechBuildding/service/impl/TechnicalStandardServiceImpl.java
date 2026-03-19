package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.technical.TechnicalStandardRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.technical.TechnicalStandardResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.TechnicalStandard;
import com.techbuildding.demoTechBuildding.exception.ResourceNotFoundException;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.TechnicalStandardRepository;
import com.techbuildding.demoTechBuildding.service.StorageService;
import com.techbuildding.demoTechBuildding.service.TechnicalStandardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicalStandardServiceImpl implements TechnicalStandardService {

    private final TechnicalStandardRepository repository;
    private final ProjectRepository projectRepository;
    private final StorageService storageService;

    @Override
    @Transactional
    public TechnicalStandardResponseDTO createStandard(TechnicalStandardRequestDTO request) {
        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        }

        TechnicalStandard standard = TechnicalStandard.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .version(request.getVersion())
                .project(project)
                .build();

        return mapToResponse(repository.save(standard));
    }

    @Override
    @Transactional
    public TechnicalStandardResponseDTO updateStandard(Long id, TechnicalStandardRequestDTO request) {
        TechnicalStandard standard = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technical standard not found"));

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        }

        standard.setCode(request.getCode());
        standard.setName(request.getName());
        standard.setDescription(request.getDescription());
        standard.setCategory(request.getCategory());
        standard.setVersion(request.getVersion());
        standard.setProject(project);

        return mapToResponse(repository.save(standard));
    }

    @Override
    @Transactional
    public TechnicalStandardResponseDTO uploadFile(Long id, MultipartFile file) {
        TechnicalStandard standard = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technical standard not found"));

        String fileUrl = storageService.uploadFile(file, "technical-standards");
        standard.setFileUrl(fileUrl);
        
        return mapToResponse(repository.save(standard));
    }

    @Override
    public List<TechnicalStandardResponseDTO> getStandardsByProject(Integer projectId) {
        return repository.findByProjectIdOrProjectIsNull(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TechnicalStandardResponseDTO> getAllStandards() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteStandard(Long id) {
        repository.deleteById(id);
    }

    private TechnicalStandardResponseDTO mapToResponse(TechnicalStandard standard) {
        return TechnicalStandardResponseDTO.builder()
                .id(standard.getId())
                .code(standard.getCode())
                .name(standard.getName())
                .description(standard.getDescription())
                .category(standard.getCategory())
                .fileUrl(standard.getFileUrl())
                .version(standard.getVersion())
                .projectId(standard.getProject() != null ? standard.getProject().getId() : null)
                .projectName(standard.getProject() != null ? standard.getProject().getName() : "Global")
                .createdBy(standard.getCreatedBy())
                .createdAt(standard.getCreatedAt())
                .build();
    }
}
