package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.design.RfiCommentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.design.RfiRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.design.RfiCommentResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.design.RfiResponseDTO;
import com.techbuildding.demoTechBuildding.entity.*;
import com.techbuildding.demoTechBuildding.repository.*;
import com.techbuildding.demoTechBuildding.service.RfiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RfiServiceImpl implements RfiService {

    private final RfiRepository rfiRepository;
    private final RfiCommentRepository rfiCommentRepository;
    private final ProjectRepository projectRepository;
    private final DesignSheetRepository designSheetRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RfiResponseDTO createRfi(RfiRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        User assignee = null;
        if (request.getAssignedTo() != null) {
            assignee = userRepository.findById(request.getAssignedTo())
                    .orElseThrow(() -> new RuntimeException("User not found: " + request.getAssignedTo()));
        }

        DesignSheet sheet = null;
        if (request.getDesignSheetId() != null) {
            sheet = designSheetRepository.findById(request.getDesignSheetId())
                    .orElseThrow(() -> new RuntimeException("Design sheet not found: " + request.getDesignSheetId()));
        }

        Rfi rfi = Rfi.builder()
                .project(project)
                .title(request.getTitle())
                .question(request.getQuestion())
                .suggestedSolution(request.getSuggestedSolution())
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .assignedTo(assignee)
                .designSheet(sheet)
                .coordX(request.getCoordX())
                .coordY(request.getCoordY())
                .build();

        rfi = rfiRepository.save(rfi);
        return mapToResponseDTO(rfi);
    }

    @Override
    public List<RfiResponseDTO> getRfisByProject(Integer projectId, Integer zoneId) {
        List<Rfi> rfis;
        if (zoneId != null) {
            rfis = rfiRepository.findByProjectIdAndDesignSheet_ZoneId(projectId, zoneId);
        } else {
            rfis = rfiRepository.findByProjectId(projectId);
        }
        return rfis.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RfiResponseDTO getRfiById(Integer id) {
        Rfi rfi = rfiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFI not found: " + id));
        return mapToResponseDTO(rfi);
    }

    @Override
    @Transactional
    public RfiResponseDTO updateRfiStatus(Integer id, String status) {
        Rfi rfi = rfiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RFI not found: " + id));
        
        rfi.setStatus(status);
        if ("RESOLVED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status)) {
            rfi.setResolvedAt(LocalDateTime.now());
        }
        
        rfi = rfiRepository.save(rfi);
        return mapToResponseDTO(rfi);
    }

    @Override
    @Transactional
    public RfiCommentResponseDTO addComment(RfiCommentRequestDTO request) {
        Rfi rfi = rfiRepository.findById(request.getRfiId())
                .orElseThrow(() -> new RuntimeException("RFI not found: " + request.getRfiId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        RfiComment comment = RfiComment.builder()
                .rfi(rfi)
                .user(user)
                .content(request.getContent())
                .build();

        comment = rfiCommentRepository.save(comment);
        return mapCommentToResponseDTO(comment);
    }

    @Override
    public List<RfiCommentResponseDTO> getCommentsByRfi(Integer rfiId) {
        return rfiCommentRepository.findByRfiId(rfiId).stream()
                .map(this::mapCommentToResponseDTO)
                .collect(Collectors.toList());
    }

    private RfiResponseDTO mapToResponseDTO(Rfi rfi) {
        return RfiResponseDTO.builder()
                .id(rfi.getId())
                .projectId(rfi.getProject().getId())
                .title(rfi.getTitle())
                .question(rfi.getQuestion())
                .suggestedSolution(rfi.getSuggestedSolution())
                .status(rfi.getStatus())
                .assignedTo(rfi.getAssignedTo() != null ? rfi.getAssignedTo().getId() : null)
                .assigneeName(rfi.getAssignedTo() != null ? rfi.getAssignedTo().getFullName() : null)
                .createdBy(null) // Handled by AbstractEntity, but if needed explicitly:
                .creatorName(rfi.getCreatedBy()) // This returns the String username from CreatedBy
                .createdAt(rfi.getCreatedAt())
                .resolvedAt(rfi.getResolvedAt())
                .designSheetId(rfi.getDesignSheet() != null ? rfi.getDesignSheet().getId() : null)
                .sheetNumber(rfi.getDesignSheet() != null ? rfi.getDesignSheet().getSheetNumber() : null)
                .coordX(rfi.getCoordX())
                .coordY(rfi.getCoordY())
                .build();
    }

    private RfiCommentResponseDTO mapCommentToResponseDTO(RfiComment comment) {
        return RfiCommentResponseDTO.builder()
                .id(comment.getId())
                .rfiId(comment.getRfi().getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getFullName())
                .userAvatar(comment.getUser().getAvatarUrl())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
