package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.contract.ContractRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ContractService {
    ContractResponseDTO createContract(ContractRequestDTO request, MultipartFile file);

    List<ContractResponseDTO> getAllContracts();

    List<ContractResponseDTO> getContractsByProject(Integer projectId);

    ContractResponseDTO getContractById(Integer contractId);

    ContractResponseDTO updateContract(Integer contractId, ContractRequestDTO request, MultipartFile file);

    void deleteContract(Integer contractId);

    // Contract Material Limits
    void setMaterialLimit(com.techbuildding.demoTechBuildding.dto.request.contract.ContractMaterialLimitRequestDTO request);
    List<com.techbuildding.demoTechBuildding.dto.response.contract.ContractMaterialLimitResponseDTO> getMaterialLimits(Integer contractId);

    // Contract Attachments
    com.techbuildding.demoTechBuildding.dto.response.contract.ContractAttachmentResponseDTO uploadAttachment(Integer contractId, MultipartFile file, Long userId);
    List<com.techbuildding.demoTechBuildding.dto.response.contract.ContractAttachmentResponseDTO> getAttachments(Integer contractId);
    void deleteAttachment(Integer attachmentId);
}
