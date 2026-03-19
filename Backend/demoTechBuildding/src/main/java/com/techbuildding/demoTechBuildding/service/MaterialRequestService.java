package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.material.MaterialReqDTO;
import com.techbuildding.demoTechBuildding.dto.response.material.MaterialRequestResponseDTO;
import java.util.List;

public interface MaterialRequestService {
    MaterialRequestResponseDTO createRequest(MaterialReqDTO request);

    MaterialRequestResponseDTO updateRequest(Integer id, MaterialReqDTO request);

    List<MaterialRequestResponseDTO> getByProject(Integer projectId);

    List<MaterialRequestResponseDTO> getAllRequests();

    MaterialRequestResponseDTO getById(Integer id);

    MaterialRequestResponseDTO checkRequest(Integer id, Long userId, String notes);

    MaterialRequestResponseDTO approveRequest(Integer id, Long userId, String notes);

    MaterialRequestResponseDTO rejectRequest(Integer id, Long userId, String notes);

    void deleteRequest(Integer id);
}
