package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.user.RoleRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.user.RoleRequestResponseDTO;

import java.util.List;

public interface RoleRequestService {
    RoleRequestResponseDTO createRequest(Long userId, RoleRequestDTO request);
    List<RoleRequestResponseDTO> getAllRequests();
    RoleRequestResponseDTO updateRequestStatus(Long requestId, String status, String adminNote);
}
