package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.design.RfiCommentRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.design.RfiRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.design.RfiCommentResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.design.RfiResponseDTO;
import com.techbuildding.demoTechBuildding.service.RfiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rfis")
@RequiredArgsConstructor
@Tag(name = "RFI Controller", description = "Endpoints for technical discussion and Request for Information")
public class RfiController {

    private final RfiService rfiService;

    @Operation(summary = "Create a new RFI")
    @PostMapping
    public ResponseData<RfiResponseDTO> createRfi(@RequestBody RfiRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Created", rfiService.createRfi(request));
    }

    @Operation(summary = "Get RFIs by project")
    @GetMapping("/project/{projectId}")
    public ResponseData<List<RfiResponseDTO>> getRfisByProject(
            @PathVariable("projectId") Integer projectId,
            @RequestParam(name = "zoneId", required = false) Integer zoneId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", rfiService.getRfisByProject(projectId, zoneId));
    }

    @Operation(summary = "Get RFI by ID")
    @GetMapping("/{id}")
    public ResponseData<RfiResponseDTO> getRfiById(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", rfiService.getRfiById(id));
    }

    @Operation(summary = "Update RFI status")
    @PatchMapping("/{id}/status")
    public ResponseData<RfiResponseDTO> updateStatus(
            @PathVariable("id") Integer id,
            @RequestParam("status") String status) {
        return new ResponseData<>(HttpStatus.OK.value(), "Status updated", rfiService.updateRfiStatus(id, status));
    }

    @Operation(summary = "Add a comment to an RFI")
    @PostMapping("/{id}/comments")
    public ResponseData<RfiCommentResponseDTO> addComment(
            @PathVariable("id") Integer id,
            @RequestBody RfiCommentRequestDTO request) {
        request.setRfiId(id);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Comment added", rfiService.addComment(request));
    }

    @Operation(summary = "Get comments for an RFI")
    @GetMapping("/{id}/comments")
    public ResponseData<List<RfiCommentResponseDTO>> getComments(@PathVariable("id") Integer id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", rfiService.getCommentsByRfi(id));
    }
}
