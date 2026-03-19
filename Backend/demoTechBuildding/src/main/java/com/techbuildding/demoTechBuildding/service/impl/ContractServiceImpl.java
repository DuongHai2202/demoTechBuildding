package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.contract.ContractRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractResponseDTO;
import com.techbuildding.demoTechBuildding.dto.request.contract.ContractMaterialLimitRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractMaterialLimitResponseDTO;
import com.techbuildding.demoTechBuildding.entity.Contract;
import com.techbuildding.demoTechBuildding.entity.ContractMaterialLimit;
import com.techbuildding.demoTechBuildding.entity.Material;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.mapper.ContractMapper;
import com.techbuildding.demoTechBuildding.repository.ContractMaterialLimitRepository;
import com.techbuildding.demoTechBuildding.repository.ContractRepository;
import com.techbuildding.demoTechBuildding.repository.MaterialRepository;
import com.techbuildding.demoTechBuildding.repository.PartnerRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.ContractAttachmentRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.service.ContractService;
import com.techbuildding.demoTechBuildding.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final ContractMapper contractMapper;

    @Override
    @Transactional
    public ContractResponseDTO createContract(ContractRequestDTO request, MultipartFile file) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Contract contract = contractMapper.toEntity(request);
        contract.setProject(project);

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
        
        if (request.getWorkflowStep() != null) {
            contract.setWorkflowStep(request.getWorkflowStep());
        }
        
        if (request.getGuaranteeInfo() != null) {
            contract.setGuaranteeInfo(request.getGuaranteeInfo());
        }

        // Lưu file tài liệu vào MinIO (nếu có)
        // Lưu ý: Ở bản schema V1 tbl_contracts chưa có cột file_url, ta giả định truy
        // xuất qua media hoặc cần bổ sung cột sau.
        // Để demo ta sẽ upload và có thể bổ sung logic lưu URL vào bảng mở rộng.
        if (file != null && !file.isEmpty()) {
            storageService.uploadFile(file, "contracts");
            // contract.setFileUrl(url); // Cần ALTER TABLE tbl_contracts ADD COLUMN
            // file_url
        }

        Contract saved = contractRepository.save(contract);
        return contractMapper.toResponseDTO(saved);
    }

    @Override
    public List<ContractResponseDTO> getAllContracts() {
        return contractRepository.findAll().stream()
                .map(contractMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContractResponseDTO> getContractsByProject(Integer projectId) {
        return contractRepository.findByProjectId(projectId).stream()
                .map(contractMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ContractResponseDTO getContractById(Integer contractId) {
        return contractRepository.findById(contractId)
                .map(contractMapper::toResponseDTO)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
    }

    @Override
    @Transactional
    public ContractResponseDTO updateContract(Integer contractId, ContractRequestDTO request, MultipartFile file) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (request.getContractNumber() != null)
            contract.setContractNumber(request.getContractNumber());
        if (request.getContractName() != null)
            contract.setContractName(request.getContractName());
        if (request.getPartnerId() != null)
            contract.setPartner(partnerRepository.findById(request.getPartnerId()).orElse(null));
        if (request.getPartnerName() != null)
            contract.setPartnerName(request.getPartnerName());
        if (request.getContractValue() != null)
            contract.setContractValue(request.getContractValue());
        if (request.getWorkflowStep() != null)
            contract.setWorkflowStep(request.getWorkflowStep());
        if (request.getGuaranteeInfo() != null)
            contract.setGuaranteeInfo(request.getGuaranteeInfo());
        if (request.getStatus() != null)
            contract.setStatus(request.getStatus());
        if (request.getType() != null)
            contract.setType(request.getType());
        if (request.getParentId() != null)
            contract.setParentContract(contractRepository.findById(request.getParentId()).orElse(null));
        if (request.getSignedDate() != null)
            contract.setSignedDate(request.getSignedDate());
        if (request.getStartDate() != null)
            contract.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            contract.setEndDate(request.getEndDate());

        // Upload new document if provided
        if (file != null && !file.isEmpty()) {
            storageService.uploadFile(file, "contracts");
            // contract.setFileUrl(url); // TODO: Add file_url column to tbl_contracts
        }

        Contract saved = contractRepository.save(contract);
        return contractMapper.toResponseDTO(saved);
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
        
        String url = storageService.uploadFile(file, "contracts/attachments/" + contractId);
        
        com.techbuildding.demoTechBuildding.entity.ContractAttachment attachment = com.techbuildding.demoTechBuildding.entity.ContractAttachment.builder()
                .contract(contract)
                .fileName(file.getOriginalFilename())
                .fileUrl(url)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(userId != null ? userRepository.findById(userId).orElse(null) : null)
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
}
