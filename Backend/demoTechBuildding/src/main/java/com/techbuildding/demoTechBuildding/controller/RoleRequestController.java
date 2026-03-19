package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.user.RoleRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.user.RoleRequestResponseDTO;
import com.techbuildding.demoTechBuildding.service.AuthService;
import com.techbuildding.demoTechBuildding.service.RoleRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/role-requests")
@RequiredArgsConstructor
@Tag(name = "Role Request Controller", description = "Endpoints for user role/permission requests and admin approval")
public class RoleRequestController {

    private final RoleRequestService roleRequestService;
    private final AuthService authService;

    @Operation(summary = "Submit a role/permission request (for GUESTS or existing users)")
    @PostMapping
    public ResponseData<RoleRequestResponseDTO> submitRequest(@RequestBody RoleRequestDTO request) {
        // Get current user ID from security context (via AuthService utility)
        Long userId = authService.getCurrentUser().getId();
        RoleRequestResponseDTO result = roleRequestService.createRequest(userId, request);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Request submitted successfully", result);
    }

    @Operation(summary = "List all role requests (Admin only)")
    @GetMapping
    public ResponseData<List<RoleRequestResponseDTO>> getAllRequests() {
        List<RoleRequestResponseDTO> result = roleRequestService.getAllRequests();
        return new ResponseData<>(HttpStatus.OK.value(), "Fetched all requests", result);
    }

    @Operation(summary = "Approve or Reject a role request (Admin only)")
    @PatchMapping("/{id}")
    public ResponseData<RoleRequestResponseDTO> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestParam(name = "adminNote", required = false) String adminNote) {
        RoleRequestResponseDTO result = roleRequestService.updateRequestStatus(id, status, adminNote);
        return new ResponseData<>(HttpStatus.OK.value(), "Request status updated", result);
    }
}
