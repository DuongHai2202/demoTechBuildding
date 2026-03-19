package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialReqDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialRequestResponseDTO;
import com.techbuildding.demoTechBuildding.service.MaterialRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/material-requests")
@RequiredArgsConstructor
@Tag(name = "Material request controller", description = "Project material request management with workflow")
public class MaterialRequestController {

    private final MaterialRequestService materialRequestService;

    @Operation(summary = "Create material request")
    @PostMapping
    public ResponseData<MaterialRequestResponseDTO> create(@RequestBody MaterialReqDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", materialRequestService.createRequest(request));
    }

    @Operation(summary = "Update material request")
    @PutMapping("/{id}")
    public ResponseData<MaterialRequestResponseDTO> update(@PathVariable("id") Integer id, @RequestBody MaterialReqDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Updated", materialRequestService.updateRequest(id, request));
    }

    @Operation(summary = "Get all material requests")
    @GetMapping
    public ResponseData<List<MaterialRequestResponseDTO>> getAll() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", materialRequestService.getAllRequests());
    }

    @Operation(summary = "Get material request by id")
    @GetMapping("/{id}")
    public ResponseData<MaterialRequestResponseDTO> getById(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", materialRequestService.getById(id));
    }

    @Operation(summary = "Get requests by project")
    @GetMapping("/project/{projectId}")
    public ResponseData<List<MaterialRequestResponseDTO>> getByProject(@PathVariable("projectId") Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", materialRequestService.getByProject(projectId));
    }

    @Operation(summary = "Technical Check (QS/Technical)")
    @PatchMapping("/{id}/check")
    public ResponseData<MaterialRequestResponseDTO> check(@PathVariable("id") Integer id, 
                                                         @RequestParam("userId") Long userId,
                                                         @RequestParam(value = "notes", required = false) String notes) {
        return new ResponseData<>(HttpStatus.OK.value(), "Checked", materialRequestService.checkRequest(id, userId, notes));
    }

    @Operation(summary = "Manager Approve (PM)")
    @PatchMapping("/{id}/approve")
    public ResponseData<MaterialRequestResponseDTO> approve(@PathVariable("id") Integer id, 
                                                           @RequestParam("userId") Long userId,
                                                           @RequestParam(value = "notes", required = false) String notes) {
        return new ResponseData<>(HttpStatus.OK.value(), "Approved", materialRequestService.approveRequest(id, userId, notes));
    }

    @Operation(summary = "Reject request")
    @PatchMapping("/{id}/reject")
    public ResponseData<MaterialRequestResponseDTO> reject(@PathVariable("id") Integer id, 
                                                          @RequestParam("userId") Long userId,
                                                          @RequestParam(value = "notes", required = false) String notes) {
        return new ResponseData<>(HttpStatus.OK.value(), "Rejected", materialRequestService.rejectRequest(id, userId, notes));
    }

    @Operation(summary = "Delete material request")
    @DeleteMapping("/{id}")
    public ResponseData<Void> delete(@PathVariable("id") Integer id) {
        materialRequestService.deleteRequest(id);
        return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Deleted", null);
    }
}
