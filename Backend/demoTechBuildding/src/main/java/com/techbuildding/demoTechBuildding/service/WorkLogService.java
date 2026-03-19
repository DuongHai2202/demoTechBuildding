package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.worklog.WorkLogRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.worklog.WorkLogResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface WorkLogService {
    WorkLogResponseDTO createLog(WorkLogRequestDTO request, List<MultipartFile> files);

    WorkLogResponseDTO getLogById(Long logId);

    List<WorkLogResponseDTO> getLogsByProject(Integer projectId);

    List<WorkLogResponseDTO> getAllLogs();

    void deleteLog(Long logId);

    WorkLogResponseDTO checkLog(Long id, Long userId, String notes);

    WorkLogResponseDTO approveLog(Long id, Long userId, String notes);

    WorkLogResponseDTO rejectLog(Long id, Long userId, String notes);
}
