package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.technical.TechnicalStandardRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.technical.TechnicalStandardResponseDTO;
import com.techbuildding.demoTechBuildding.service.TechnicalStandardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/technical-standards")
@RequiredArgsConstructor
public class TechnicalStandardController {

    private final TechnicalStandardService service;

    @PostMapping
    public ResponseData<TechnicalStandardResponseDTO> create(@RequestBody @Valid TechnicalStandardRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Standard created successfully", service.createStandard(request));
    }

    @PutMapping("/{id}")
    public ResponseData<TechnicalStandardResponseDTO> update(@PathVariable Long id, @RequestBody @Valid TechnicalStandardRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Standard updated successfully", service.updateStandard(id, request));
    }

    @PostMapping("/{id}/upload")
    public ResponseData<TechnicalStandardResponseDTO> upload(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return new ResponseData<>(HttpStatus.OK.value(), "File uploaded successfully", service.uploadFile(id, file));
    }

    @GetMapping
    public ResponseData<List<TechnicalStandardResponseDTO>> getAll() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", service.getAllStandards());
    }

    @GetMapping("/project/{projectId}")
    public ResponseData<List<TechnicalStandardResponseDTO>> getByProject(@PathVariable Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", service.getStandardsByProject(projectId));
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> delete(@PathVariable Long id) {
        service.deleteStandard(id);
        return new ResponseData<>(HttpStatus.OK.value(), "Standard deleted successfully");
    }
}
