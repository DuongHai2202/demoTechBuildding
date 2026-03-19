package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialReqDTO;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialRequestResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Material;
import com.techbuildding.demoTechBuildding.entity.MaterialRequest;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.repository.MaterialRepository;
import com.techbuildding.demoTechBuildding.repository.MaterialRequestRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.dto.request.submission.SubmissionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.submission.SubmissionStepRequestDTO;
import com.techbuildding.demoTechBuildding.service.MaterialRequestService;
import com.techbuildding.demoTechBuildding.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialRequestServiceImpl implements MaterialRequestService {

    private final MaterialRequestRepository materialRequestRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MaterialRepository materialRepository;
    private final SubmissionService submissionService;

    public MaterialRequestServiceImpl(
            MaterialRequestRepository materialRequestRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            MaterialRepository materialRepository,
            SubmissionService submissionService) {
        this.materialRequestRepository = materialRequestRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
        this.submissionService = submissionService;
    }

    @Override
    @Transactional
    public MaterialRequestResponseDTO createRequest(MaterialReqDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User user = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new RuntimeException("Material not found"));

        MaterialRequest req = MaterialRequest.builder()
                .project(project)
                .requester(user)
                .material(material)
                .requestedQuantity(request.getRequestedQuantity())
                .status("PENDING")
                .build();

        MaterialRequest saved = materialRequestRepository.save(req);

        // Auto-create Submission Workflow
        submissionService.createSubmission(SubmissionRequestDTO.builder()
                .projectId(project.getId())
                .title("Yêu cầu vật tư: " + material.getNameVi())
                .submissionType("MATERIAL_REQUEST")
                .referenceId(saved.getId().longValue())
                .steps(List.of(
                        SubmissionStepRequestDTO.builder().stepName("Kiểm tra kỹ thuật").stepOrder(1).assignedRole("SUPERVISOR").build(),
                        SubmissionStepRequestDTO.builder().stepName("Phê duyệt PM").stepOrder(2).assignedRole("PM").build()
                ))
                .build());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public MaterialRequestResponseDTO updateRequest(Integer id, MaterialReqDTO request) {
        MaterialRequest req = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found: " + id));
        
        if (!"PENDING".equals(req.getStatus())) {
            throw new RuntimeException("Only PENDING requests can be updated");
        }

        if (request.getMaterialId() != null) {
            Material material = materialRepository.findById(request.getMaterialId())
                    .orElseThrow(() -> new RuntimeException("Material not found: " + request.getMaterialId()));
            req.setMaterial(material);
        }
        
        if (request.getRequestedQuantity() != null) {
            req.setRequestedQuantity(request.getRequestedQuantity());
        }

        if (request.getNotes() != null) {
            req.setNotes(request.getNotes());
        }

        return mapToResponse(materialRequestRepository.save(req));
    }

    @Override
    public List<MaterialRequestResponseDTO> getByProject(Integer projectId) {
        return materialRequestRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialRequestResponseDTO> getAllRequests() {
        return materialRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaterialRequestResponseDTO getById(Integer id) {
        MaterialRequest req = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found: " + id));
        return mapToResponse(req);
    }

    @Override
    @Transactional
    public MaterialRequestResponseDTO checkRequest(Integer id, Long userId, String notes) {
        MaterialRequest req = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        // BETTER: Use authenticated user
        String username = getAuthenticatedUsername();
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found: " + username)));

        req.setStatus("CHECKED");
        req.setCheckedBy(user);
        req.setCheckedAt(LocalDateTime.now());
        if (notes != null) req.setNotes(notes);

        return mapToResponse(materialRequestRepository.save(req));
    }

    @Override
    @Transactional
    public MaterialRequestResponseDTO approveRequest(Integer id, Long userId, String notes) {
        MaterialRequest req = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        String username = getAuthenticatedUsername();
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username)));

        req.setStatus("APPROVED");
        req.setApprovedBy(user);
        req.setApprovedAt(LocalDateTime.now());
        if (notes != null) req.setNotes(notes);

        return mapToResponse(materialRequestRepository.save(req));
    }

    @Override
    @Transactional
    public MaterialRequestResponseDTO rejectRequest(Integer id, Long userId, String notes) {
        MaterialRequest req = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setStatus("REJECTED");
        if (notes != null) req.setNotes(notes);

        return mapToResponse(materialRequestRepository.save(req));
    }

    private String getAuthenticatedUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }

    @Override
    @Transactional
    public void deleteRequest(Integer id) {
        if (!materialRequestRepository.existsById(id)) {
            throw new RuntimeException("Request not found: " + id);
        }
        materialRequestRepository.deleteById(id);
    }

    private MaterialRequestResponseDTO mapToResponse(MaterialRequest req) {
        MaterialRequestResponseDTO dto = new MaterialRequestResponseDTO();
        dto.setId(req.getId());
        dto.setProjectId(req.getProject().getId());
        dto.setProjectName(req.getProject().getName());
        dto.setRequesterId(req.getRequester().getId());
        dto.setRequesterName(req.getRequester().getFullName());
        dto.setMaterialId(req.getMaterial().getId());
        dto.setMaterialName(req.getMaterial().getNameVi());
        dto.setMaterialUnit(req.getMaterial().getUnit());
        dto.setRequestedQuantity(req.getRequestedQuantity());
        dto.setStatus(req.getStatus());
        dto.setCheckedBy(req.getCheckedBy() != null ? req.getCheckedBy().getId() : null);
        dto.setCheckedByName(req.getCheckedBy() != null ? req.getCheckedBy().getFullName() : null);
        dto.setApprovedBy(req.getApprovedBy() != null ? req.getApprovedBy().getId() : null);
        dto.setApprovedByName(req.getApprovedBy() != null ? req.getApprovedBy().getFullName() : null);
        dto.setCheckedAt(req.getCheckedAt());
        dto.setApprovedAt(req.getApprovedAt());
        dto.setNotes(req.getNotes());
        dto.setCreatedAt(req.getCreatedAt()); 
        // Note: AbstractEntity createdAt is LocalDate, changed to atStartOfDay for DTO LocalDateTime
        return dto;
    }
}
