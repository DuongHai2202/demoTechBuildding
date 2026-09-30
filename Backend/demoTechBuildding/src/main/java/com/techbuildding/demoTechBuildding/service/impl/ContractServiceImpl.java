package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.contract.ContractRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractResponseDTO;
import com.techbuildding.demoTechBuildding.dto.request.contract.ContractMaterialLimitRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractMaterialLimitResponseDTO;
import com.techbuildding.demoTechBuildding.dto.request.contract.ContractWorkflowTransitionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractWorkflowHistoryResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractFileDownload;
import com.techbuildding.demoTechBuildding.entity.Contract;
import com.techbuildding.demoTechBuildding.entity.ContractAttachment;
import com.techbuildding.demoTechBuildding.entity.ContractMaterialLimit;
import com.techbuildding.demoTechBuildding.entity.ContractWorkflowHistory;
import com.techbuildding.demoTechBuildding.entity.Material;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.mapper.ContractMapper;
import com.techbuildding.demoTechBuildding.repository.ContractMaterialLimitRepository;
import com.techbuildding.demoTechBuildding.repository.ContractRepository;
import com.techbuildding.demoTechBuildding.repository.MaterialRepository;
import com.techbuildding.demoTechBuildding.repository.PartnerRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.ContractAttachmentRepository;
import com.techbuildding.demoTechBuildding.repository.ContractWorkflowHistoryRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.ContractService;
import com.techbuildding.demoTechBuildding.service.StorageService;
import com.techbuildding.demoTechBuildding.exception.DuplicateResourceException;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.util.code.StandardCodeGenerator;
import com.techbuildding.demoTechBuildding.util.code.StandardCodeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final ProjectRepository projectRepository;
    private final PartnerRepository partnerRepository;
    private final MaterialRepository materialRepository;
    private final ContractMaterialLimitRepository contractMaterialLimitRepository;
    private final ContractAttachmentRepository contractAttachmentRepository;
    private final ContractWorkflowHistoryRepository workflowHistoryRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final ContractMapper contractMapper;
    private final StandardCodeGenerator codeGenerator;

    @Override
    @Transactional
    public ContractResponseDTO createContract(ContractRequestDTO request, MultipartFile file) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Contract contract = contractMapper.toEntity(request);
        contract.setProject(project);

        String contractNumber = codeGenerator.cleanProvidedCode(request.getContractNumber());
        if (contractNumber == null) {
            contractNumber = codeGenerator.next(StandardCodeType.CONTRACT, contractRepository::existsByContractNumber);
        } else if (contractRepository.existsByContractNumber(contractNumber)) {
            throw new DuplicateResourceException("Số hiệu hợp đồng '" + contractNumber + "' đã tồn tại.");
        }
        contract.setContractNumber(contractNumber);

        if (request.getPartnerId() != null) {
            contract.setPartner(partnerRepository.findById(request.getPartnerId()).orElse(null));
        }
        
        if (request.getParentId() != null) {
            contract.setParentContract(contractRepository.findById(request.getParentId()).orElse(null));
        }

        if (request.getType() != null) {
            contract.setType(request.getType());
        }

        if (request.getSignedDate() != null) contract.setSignedDate(request.getSignedDate());
        if (request.getStartDate() != null) contract.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) contract.setEndDate(request.getEndDate());
        
        int initialWorkflowStep = normalizeWorkflowStep(request.getWorkflowStep());
        validateWorkflowStep(initialWorkflowStep);
        contract.setWorkflowStep(initialWorkflowStep);
        if (initialWorkflowStep > 1) {
            validateWorkflowPrerequisites(contract, initialWorkflowStep);
        }
        
        if (request.getGuaranteeInfo() != null) {
            contract.setGuaranteeInfo(request.getGuaranteeInfo());
        }

        Contract saved = contractRepository.save(contract);
        if (file != null && !file.isEmpty()) {
            saveContractDocument(saved, file);
        }
        saveWorkflowHistory(saved, null, normalizeWorkflowStep(saved.getWorkflowStep()), "INITIAL", "Khởi tạo hợp đồng.");
        return toResponseDTO(saved);
    }

    @Override
    public List<ContractResponseDTO> getAllContracts() {
        return contractRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContractResponseDTO> getContractsByProject(Integer projectId) {
        return contractRepository.findByProjectId(projectId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ContractResponseDTO getContractById(Integer contractId) {
        return contractRepository.findById(contractId)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public ContractFileDownload downloadContractDocument(Integer contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));
        ContractAttachment attachment = contractAttachmentRepository
                .findFirstByContractIdAndIsDeletedFalseOrderByCreatedAtDesc(contractId);

        if (attachment == null || attachment.getFileUrl() == null || attachment.getFileUrl().isBlank()) {
            throw new BadRequestException("Hợp đồng chưa có tài liệu để tải xuống.");
        }

        byte[] content = storageService.downloadFileByUrl(attachment.getFileUrl());
        String fileName = safeFileName(attachment.getFileName(), contract.getContractNumber() + "-hop-dong");
        String contentType = attachment.getFileType();
        if (contentType == null || contentType.isBlank()) {
            contentType = contentTypeFromFileName(fileName);
        }

        return ContractFileDownload.builder()
                .content(content)
                .fileName(fileName)
                .contentType(contentType)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ContractFileDownload downloadContractAttachment(Integer attachmentId) {
        ContractAttachment attachment = contractAttachmentRepository.findById(attachmentId)
                .filter(item -> !Boolean.TRUE.equals(item.getIsDeleted()))
                .orElseThrow(() -> new RuntimeException("Attachment not found: " + attachmentId));

        byte[] content = storageService.downloadFileByUrl(attachment.getFileUrl());
        String fileName = safeFileName(attachment.getFileName(), "tai-lieu-hop-dong");
        String contentType = attachment.getFileType();
        if (contentType == null || contentType.isBlank()) {
            contentType = contentTypeFromFileName(fileName);
        }

        return ContractFileDownload.builder()
                .content(content)
                .fileName(fileName)
                .contentType(contentType)
                .build();
    }

    @Override
    @Transactional
    public ContractResponseDTO updateContract(Integer contractId, ContractRequestDTO request, MultipartFile file) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (request.getProjectId() != null
                && (contract.getProject() == null || !request.getProjectId().equals(contract.getProject().getId()))) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));
            contract.setProject(project);
        }

        if (request.getContractNumber() != null && !request.getContractNumber().isBlank()) {
            String contractNumber = request.getContractNumber().trim();
            if (!contractNumber.equalsIgnoreCase(contract.getContractNumber())
                    && contractRepository.existsByContractNumberAndIdNot(contractNumber, contractId)) {
                throw new DuplicateResourceException("Số hiệu hợp đồng '" + contractNumber + "' đã tồn tại.");
            }
            contract.setContractNumber(contractNumber);
        }
        if (request.getContractName() != null)
            contract.setContractName(request.getContractName());
        if (request.getPartnerId() != null)
            contract.setPartner(partnerRepository.findById(request.getPartnerId()).orElse(null));
        if (request.getPartnerName() != null)
            contract.setPartnerName(request.getPartnerName());
        if (request.getContractValue() != null)
            contract.setContractValue(request.getContractValue());
        if (request.getGuaranteeInfo() != null)
            contract.setGuaranteeInfo(request.getGuaranteeInfo());
        if (request.getStatus() != null)
            contract.setStatus(request.getStatus());
        if (request.getType() != null) {
            contract.setType(request.getType());
            if ("MAIN".equalsIgnoreCase(request.getType())) {
                contract.setParentContract(null);
            } else if (request.getParentId() != null) {
                contract.setParentContract(contractRepository.findById(request.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent contract not found: " + request.getParentId())));
            }
        } else if (request.getParentId() != null) {
            contract.setParentContract(contractRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent contract not found: " + request.getParentId())));
        }
        if (request.getSignedDate() != null)
            contract.setSignedDate(request.getSignedDate());
        if (request.getStartDate() != null)
            contract.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            contract.setEndDate(request.getEndDate());

        // Luôn chuyển bước sau khi đã cập nhật các mốc ngày và dữ liệu liên quan,
        // để một request hợp lệ có thể bổ sung điều kiện rồi chuyển bước trong cùng lần lưu.
        if (request.getWorkflowStep() != null
                && !request.getWorkflowStep().equals(normalizeWorkflowStep(contract.getWorkflowStep()))) {
            applyWorkflowTransition(contract, request.getWorkflowStep(), "Cập nhật bước từ biểu mẫu hợp đồng.");
        }

        Contract saved = contractRepository.save(contract);
        if (file != null && !file.isEmpty()) {
            saveContractDocument(saved, file);
        }
        return toResponseDTO(saved);
    }

    @Override
    @Transactional
    public ContractResponseDTO transitionWorkflow(Integer contractId, ContractWorkflowTransitionRequestDTO request) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));
        String note = request.getNote() == null ? null : request.getNote().trim();
        applyWorkflowTransition(contract, request.getTargetStep(), note);
        return toResponseDTO(contractRepository.save(contract));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractWorkflowHistoryResponseDTO> getWorkflowHistory(Integer contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new RuntimeException("Contract not found: " + contractId);
        }
        return workflowHistoryRepository.findByContractIdOrderByCreatedAtDesc(contractId).stream()
                .map(history -> ContractWorkflowHistoryResponseDTO.builder()
                        .id(history.getId())
                        .fromStep(history.getFromStep())
                        .toStep(history.getToStep())
                        .action(history.getAction())
                        .note(history.getNote())
                        .changedBy(history.getChangedBy())
                        .createdAt(history.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private void applyWorkflowTransition(Contract contract, Integer targetStep, String note) {
        int currentStep = normalizeWorkflowStep(contract.getWorkflowStep());
        validateWorkflowStep(targetStep);

        if (targetStep == currentStep) {
            return;
        }

        boolean returning = targetStep < currentStep;
        if (!returning && targetStep != currentStep + 1) {
            throw new com.techbuildding.demoTechBuildding.exception.BadRequestException(
                    "Không được bỏ qua bước. Hãy chuyển tuần tự từ bước " + currentStep + " sang bước " + (currentStep + 1) + ".");
        }
        if (returning && (note == null || note.isBlank())) {
            throw new com.techbuildding.demoTechBuildding.exception.BadRequestException(
                    "Khi trả lại bước trước phải ghi rõ lý do xử lý lại.");
        }

        validateWorkflowPrerequisites(contract, targetStep);
        contract.setWorkflowStep(targetStep);
        if (targetStep == 7) {
            contract.setStatus("COMPLETED");
        } else if ("COMPLETED".equalsIgnoreCase(contract.getStatus()) && returning) {
            contract.setStatus("ACTIVE");
        }

        saveWorkflowHistory(contract, currentStep, targetStep, returning ? "RETURN" : "ADVANCE", note);
    }

    private void validateWorkflowPrerequisites(Contract contract, int targetStep) {
        if (targetStep >= 2 && (contract.getProject() == null || contract.getPartner() == null
                || contract.getContractValue() == null || contract.getContractValue().signum() < 0)) {
            throw new com.techbuildding.demoTechBuildding.exception.BadRequestException(
                    "Cần có dự án, đối tác và giá trị hợp đồng hợp lệ trước khi chuyển sang bước đấu thầu.");
        }
        if (targetStep >= 5 && contract.getSignedDate() == null) {
            throw new com.techbuildding.demoTechBuildding.exception.BadRequestException(
                    "Cần cập nhật ngày ký trước khi chuyển sang giai đoạn thực hiện hợp đồng.");
        }
        if (targetStep >= 6 && contract.getStartDate() == null) {
            throw new com.techbuildding.demoTechBuildding.exception.BadRequestException(
                    "Cần cập nhật ngày bắt đầu trước khi chuyển sang thanh toán giai đoạn.");
        }
        if (targetStep >= 7 && contract.getEndDate() == null) {
            throw new com.techbuildding.demoTechBuildding.exception.BadRequestException(
                    "Cần cập nhật ngày kết thúc trước khi quyết toán hợp đồng.");
        }
    }

    private int normalizeWorkflowStep(Integer step) {
        return step == null ? 1 : step;
    }

    private void validateWorkflowStep(Integer step) {
        if (step == null || step < 1 || step > 7) {
            throw new com.techbuildding.demoTechBuildding.exception.BadRequestException(
                    "Bước quy trình phải nằm trong khoảng từ 1 đến 7.");
        }
    }

    private void saveWorkflowHistory(Contract contract, Integer fromStep, Integer toStep, String action, String note) {
        workflowHistoryRepository.save(ContractWorkflowHistory.builder()
                .contract(contract)
                .fromStep(fromStep)
                .toStep(toStep)
                .action(action)
                .note(note == null || note.isBlank() ? null : note)
                .changedBy(currentActor())
                .build());
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "SYSTEM";
        }
        return authentication.getName();
    }

    @Override
    @Transactional
    public void deleteContract(Integer contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new RuntimeException("Contract not found: " + contractId);
        }
        contractRepository.deleteById(contractId);
    }

    @Override
    @Transactional
    public void setMaterialLimit(ContractMaterialLimitRequestDTO request) {
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        Material material = materialRepository.findById(request.getMaterialId())
                .orElseThrow(() -> new RuntimeException("Material not found"));

        ContractMaterialLimit limit = ContractMaterialLimit.builder()
                .contract(contract)
                .material(material)
                .limitQuantity(request.getLimitQuantity())
                .type(request.getType() != null ? ContractMaterialLimit.MaterialLimitType.valueOf(request.getType()) : ContractMaterialLimit.MaterialLimitType.CONTRACTOR_SUPPLIED)
                .notes(request.getNotes())
                .build();
        
        contractMaterialLimitRepository.save(limit);
    }

    @Override
    public List<ContractMaterialLimitResponseDTO> getMaterialLimits(Integer contractId) {
        return contractMaterialLimitRepository.findByContractId(contractId).stream()
                .map(limit -> {
                    ContractMaterialLimitResponseDTO dto = new ContractMaterialLimitResponseDTO();
                    dto.setId(limit.getId());
                    dto.setContractId(limit.getContract().getId());
                    dto.setMaterialId(limit.getMaterial().getId());
                    dto.setMaterialName(limit.getMaterial().getNameVi());
                    dto.setMaterialUnit(limit.getMaterial().getUnit());
                    dto.setLimitQuantity(limit.getLimitQuantity());
                    dto.setType(limit.getType() != null ? limit.getType().name() : null);
                    dto.setNotes(limit.getNotes());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public com.techbuildding.demoTechBuildding.dto.response.contract.ContractAttachmentResponseDTO uploadAttachment(Integer contractId, MultipartFile file, Long userId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tài liệu tải lên không được để trống.");
        }

        String url = storageService.uploadFile(file, "contracts/attachments/" + contractId);
        
        com.techbuildding.demoTechBuildding.entity.ContractAttachment attachment = com.techbuildding.demoTechBuildding.entity.ContractAttachment.builder()
                .contract(contract)
                .fileName(safeFileName(file.getOriginalFilename(), "tai-lieu-hop-dong"))
                .fileUrl(url)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(currentUser())
                .build();
        
        com.techbuildding.demoTechBuildding.entity.ContractAttachment saved = contractAttachmentRepository.save(attachment);
        
        return com.techbuildding.demoTechBuildding.dto.response.contract.ContractAttachmentResponseDTO.builder()
                .id(saved.getId())
                .fileName(saved.getFileName())
                .fileUrl(saved.getFileUrl())
                .fileType(saved.getFileType())
                .fileSize(saved.getFileSize())
                .uploadedBy(saved.getUploadedBy() != null ? saved.getUploadedBy().getId() : null)
                .uploaderName(saved.getUploadedBy() != null ? saved.getUploadedBy().getFullName() : null)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public List<com.techbuildding.demoTechBuildding.dto.response.contract.ContractAttachmentResponseDTO> getAttachments(Integer contractId) {
        return contractAttachmentRepository.findByContractIdAndIsDeletedFalse(contractId).stream()
                .map(a -> com.techbuildding.demoTechBuildding.dto.response.contract.ContractAttachmentResponseDTO.builder()
                        .id(a.getId())
                        .fileName(a.getFileName())
                        .fileUrl(a.getFileUrl())
                        .fileType(a.getFileType())
                        .fileSize(a.getFileSize())
                        .uploadedBy(a.getUploadedBy() != null ? a.getUploadedBy().getId() : null)
                        .uploaderName(a.getUploadedBy() != null ? a.getUploadedBy().getFullName() : null)
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAttachment(Integer attachmentId) {
        com.techbuildding.demoTechBuildding.entity.ContractAttachment attachment = contractAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        attachment.setIsDeleted(true);
        contractAttachmentRepository.save(attachment);
    }

    private ContractResponseDTO toResponseDTO(Contract contract) {
        ContractResponseDTO response = contractMapper.toResponseDTO(contract);
        ContractAttachment latest = contractAttachmentRepository
                .findFirstByContractIdAndIsDeletedFalseOrderByCreatedAtDesc(contract.getId());
        if (latest != null) {
            response.setFileUrl(latest.getFileUrl());
        }
        return response;
    }

    private void saveContractDocument(Contract contract, MultipartFile file) {
        String url = storageService.uploadFile(file, "contracts/attachments/" + contract.getId());
        ContractAttachment attachment = ContractAttachment.builder()
                .contract(contract)
                .fileName(safeFileName(file.getOriginalFilename(), contract.getContractNumber() + "-hop-dong"))
                .fileUrl(url)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(currentUser())
                .build();
        contractAttachmentRepository.save(attachment);
    }

    private com.techbuildding.demoTechBuildding.entity.User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    private String safeFileName(String originalName, String fallback) {
        if (originalName == null || originalName.isBlank()) {
            return fallback;
        }
        String normalized = originalName.replace('\\', '/');
        String fileName = normalized.substring(normalized.lastIndexOf('/') + 1).trim();
        return fileName.isBlank() ? fallback : fileName;
    }

    private String contentTypeFromFileName(String fileName) {
        String lower = fileName.toLowerCase(java.util.Locale.ROOT);
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".doc")) return "application/msword";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
        if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        return "application/octet-stream";
    }
}
