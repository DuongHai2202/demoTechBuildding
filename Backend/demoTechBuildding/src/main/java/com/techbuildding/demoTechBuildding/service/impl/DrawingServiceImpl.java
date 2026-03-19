package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.contract.DrawingRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.DrawingResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Contract;
import com.techbuildding.demoTechBuildding.entity.Drawing;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.repository.ContractRepository;
import com.techbuildding.demoTechBuildding.repository.DrawingRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.service.DrawingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrawingServiceImpl implements DrawingService {

    private final DrawingRepository drawingRepository;
    private final ProjectRepository projectRepository;
    private final ContractRepository contractRepository;

    @Override
    public DrawingResponseDTO createDrawing(DrawingRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));
        
        Contract contract = null;
        if (request.getContractId() != null) {
            contract = contractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new RuntimeException("Contract not found: " + request.getContractId()));
        }

        Drawing drawing = Drawing.builder()
                .project(project)
                .contract(contract)
                .name(request.getName())
                .drawingNumber(request.getDrawingNumber())
                .fileUrl(request.getFileUrl())
                .version(request.getVersion())
                .build();

        return mapToResponse(drawingRepository.save(drawing));
    }

    @Override
    public List<DrawingResponseDTO> getDrawingsByProject(Integer projectId) {
        return drawingRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<DrawingResponseDTO> getDrawingsByContract(Integer contractId) {
        return drawingRepository.findByContractId(contractId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteDrawing(Integer id) {
        drawingRepository.deleteById(id);
    }

    private DrawingResponseDTO mapToResponse(Drawing d) {
        DrawingResponseDTO dto = new DrawingResponseDTO();
        dto.setId(d.getId());
        dto.setProjectId(d.getProject().getId());
        dto.setContractId(d.getContract() != null ? d.getContract().getId() : null);
        dto.setName(d.getName());
        dto.setDrawingNumber(d.getDrawingNumber());
        dto.setFileUrl(d.getFileUrl());
        dto.setVersion(d.getVersion());
        return dto;
    }
}
