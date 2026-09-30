package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.contract.ContractMaterialLimitRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.contract.ContractRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.contract.ContractWorkflowTransitionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractMaterialLimitResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractWorkflowHistoryResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.ContractFileDownload;
import com.techbuildding.demoTechBuildding.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ContentDisposition;
import java.nio.charset.StandardCharsets;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
@Tag(name = "Contract controller", description = "Documents and contracts management")
public class ContractController {

    private final ContractService contractService;

    @Operation(summary = "Create contract with document")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<ContractResponseDTO> create(
            @RequestPart("data") ContractRequestDTO request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", contractService.createContract(request, file));
    }

    @Operation(summary = "Get all contracts")
    @GetMapping
    public ResponseData<List<ContractResponseDTO>> getAll() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", contractService.getAllContracts());
    }

    @Operation(summary = "Get contract by id")
    @GetMapping("/{id}")
    public ResponseData<ContractResponseDTO> getById(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", contractService.getContractById(id));
    }

    @Operation(summary = "Download the latest contract document")
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable("id") Integer id) {
        ContractFileDownload document = contractService.downloadContractDocument(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(document.getContentType()));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(document.getFileName(), StandardCharsets.UTF_8)
                .build());
        headers.setContentLength(document.getContent().length);
        return new ResponseEntity<>(document.getContent(), headers, HttpStatus.OK);
    }

    @Operation(summary = "Get contracts by project")
    @GetMapping("/project/{projectId}")
    public ResponseData<List<ContractResponseDTO>> getByProject(@PathVariable("projectId") Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", contractService.getContractsByProject(projectId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<ContractResponseDTO> update(
            @PathVariable("id") Integer id,
            @RequestPart("data") ContractRequestDTO request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return new ResponseData<>(HttpStatus.OK.value(), "Updated", contractService.updateContract(id, request, file));
    }

    @Operation(summary = "Transition contract workflow")
    @PostMapping("/{id}/workflow-transition")
    public ResponseData<ContractResponseDTO> transitionWorkflow(
            @PathVariable("id") Integer id,
            @Valid @RequestBody ContractWorkflowTransitionRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Workflow transitioned", contractService.transitionWorkflow(id, request));
    }

    @Operation(summary = "Get contract workflow history")
    @GetMapping("/{id}/workflow-history")
    public ResponseData<List<ContractWorkflowHistoryResponseDTO>> getWorkflowHistory(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", contractService.getWorkflowHistory(id));
    }

    @Operation(summary = "Delete contract by id")
    @DeleteMapping("/{id}")
    public ResponseData<Void> delete(@PathVariable("id") Integer id) {
        contractService.deleteContract(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted", null);
    }

    // --- Contract Material Limits ---
    @Operation(summary = "Set material limit for contract")
    @PostMapping("/material-limits")
    public ResponseData<Void> setMaterialLimit(@RequestBody ContractMaterialLimitRequestDTO request) {
        contractService.setMaterialLimit(request);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Limit set", null);
    }

    @Operation(summary = "Get material limits by contract")
    @GetMapping("/{id}/material-limits")
    public ResponseData<List<ContractMaterialLimitResponseDTO>> getMaterialLimits(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", contractService.getMaterialLimits(id));
    }

    // --- Contract Attachments ---
    @Operation(summary = "Upload contract attachment")
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<com.techbuildding.demoTechBuildding.dto.response.contract.ContractAttachmentResponseDTO> uploadAttachment(
            @PathVariable("id") Integer id,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) Long userId) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Uploaded", contractService.uploadAttachment(id, file, userId));
    }

    @Operation(summary = "Get attachments by contract")
    @GetMapping("/{id}/attachments")
    public ResponseData<List<com.techbuildding.demoTechBuildding.dto.response.contract.ContractAttachmentResponseDTO>> getAttachments(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", contractService.getAttachments(id));
    }

    @Operation(summary = "Download a contract attachment")
    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable("attachmentId") Integer attachmentId) {
        ContractFileDownload document = contractService.downloadContractAttachment(attachmentId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(document.getContentType()));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(document.getFileName(), StandardCharsets.UTF_8)
                .build());
        headers.setContentLength(document.getContent().length);
        return new ResponseEntity<>(document.getContent(), headers, HttpStatus.OK);
    }

    @Operation(summary = "Delete contract attachment")
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseData<Void> deleteAttachment(@PathVariable("attachmentId") Integer attachmentId) {
        contractService.deleteAttachment(attachmentId);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted", null);
    }
}
