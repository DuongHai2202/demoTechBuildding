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
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.service.MaterialRequestService;
import com.techbuildding.demoTechBuildding.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
        validateRequestInput(request);
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        // Never trust requesterId from the browser. The authenticated account is
        // the owner of the new request and is also used for the audit trail.
        User user = getAuthenticatedUser();
        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new RuntimeException("Material not found"));

        MaterialRequest req = MaterialRequest.builder()
                .project(project)
                .requester(user)
                .material(material)
                .requestedQuantity(request.getRequestedQuantity())
                .status("PENDING")
                .notes(request.getNotes())
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

        User currentUser = getAuthenticatedUser();
        ensureCanEdit(req, currentUser);
        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException("Chỉ yêu cầu đang chờ duyệt mới được chỉnh sửa.");
        }

        if (request.getMaterialId() == null || request.getRequestedQuantity() == null) {
            throw new BadRequestException("Vật tư và số lượng là bắt buộc.");
        }
        if (!Float.isFinite(request.getRequestedQuantity()) || request.getRequestedQuantity() <= 0) {
            throw new BadRequestException("Số lượng phải là số hữu hạn và lớn hơn 0.");
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
                .filter(this::canCurrentUserView)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaterialRequestResponseDTO> getAllRequests() {
        return materialRequestRepository.findAll().stream()
                .filter(this::canCurrentUserView)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaterialRequestResponseDTO getById(Integer id) {
        MaterialRequest req = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found: " + id));
        if (!canCurrentUserView(req)) {
            throw new AccessDeniedException("Bạn không có quyền xem yêu cầu vật tư này.");
        }
        return mapToResponse(req);
    }

    @Override
    @Transactional
    public MaterialRequestResponseDTO checkRequest(Integer id, Long userId, String notes) {
        MaterialRequest req = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        ensureStatus(req, "PENDING", "Chỉ yêu cầu đang chờ duyệt mới được kiểm tra.");
        User user = getAuthenticatedUser();

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

        ensureStatus(req, "CHECKED", "Chỉ yêu cầu đã kiểm tra kỹ thuật mới được phê duyệt.");
        User user = getAuthenticatedUser();

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

        if (!"PENDING".equals(req.getStatus()) && !"CHECKED".equals(req.getStatus())) {
            throw new BadRequestException("Chỉ yêu cầu đang chờ duyệt hoặc đã kiểm tra mới được từ chối.");
        }

        req.setStatus("REJECTED");
        if (notes != null) req.setNotes(notes);

        return mapToResponse(materialRequestRepository.save(req));
    }

    @Override
    @Transactional
    public void deleteRequest(Integer id) {
        MaterialRequest req = materialRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found: " + id));
        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException("Chỉ yêu cầu đang chờ duyệt mới được xóa để bảo toàn lịch sử xử lý.");
        }
        materialRequestRepository.delete(req);
    }

    private void validateRequestInput(MaterialReqDTO request) {
        if (request == null || request.getProjectId() == null || request.getMaterialId() == null
                || request.getRequestedQuantity() == null) {
            throw new BadRequestException("Dự án, vật tư và số lượng là bắt buộc.");
        }
        if (!Float.isFinite(request.getRequestedQuantity()) || request.getRequestedQuantity() <= 0) {
            throw new BadRequestException("Số lượng phải là số hữu hạn và lớn hơn 0.");
        }
    }

    private void ensureStatus(MaterialRequest request, String expectedStatus, String message) {
        if (!expectedStatus.equals(request.getStatus())) {
            throw new BadRequestException(message);
        }
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác này.");
        }

        Object principal = authentication.getPrincipal();
        String username = principal instanceof UserDetails
                ? ((UserDetails) principal).getUsername()
                : String.valueOf(principal);

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AccessDeniedException("Không xác định được tài khoản hiện tại."));
    }

    private boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> ("ROLE_" + role).equals(authority));
    }

    private boolean isManager() {
        return hasRole("ADMIN") || hasRole("PM");
    }

    private boolean canCurrentUserView(MaterialRequest request) {
        if (isManager()) return true;
        try {
            User currentUser = getAuthenticatedUser();
            return hasRole("STAFF") && request.getRequester() != null
                    && request.getRequester().getId().equals(currentUser.getId());
        } catch (AccessDeniedException ex) {
            return false;
        }
    }

    private void ensureCanEdit(MaterialRequest request, User currentUser) {
        if (isManager()) return;
        if (!hasRole("STAFF") || request.getRequester() == null
                || !request.getRequester().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Nhân viên chỉ được chỉnh sửa yêu cầu vật tư do chính mình tạo.");
        }
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
