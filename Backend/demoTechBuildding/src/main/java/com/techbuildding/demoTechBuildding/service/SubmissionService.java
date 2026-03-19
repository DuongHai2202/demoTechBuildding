package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.request.submission.SubmissionProcessRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.submission.SubmissionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.submission.SubmissionResponseDTO;
import java.util.List;

public interface SubmissionService {
    SubmissionResponseDTO createSubmission(SubmissionRequestDTO request);
    SubmissionResponseDTO processStep(Long submissionId, Long stepId, SubmissionProcessRequestDTO request);
    SubmissionResponseDTO getSubmission(Long id);
    SubmissionResponseDTO getSubmissionByReference(String type, Long referenceId);
    List<SubmissionResponseDTO> getProjectSubmissions(Integer projectId);
    List<SubmissionResponseDTO> getAllSubmissions();
}
