package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.submission.SubmissionProcessRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.submission.SubmissionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.submission.DigitalSignatureResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.submission.SubmissionResponseDTO;
import com.techbuildding.demoTechBuildding.dto.response.submission.SubmissionStepResponseDTO;
import com.techbuildding.demoTechBuildding.entity.*;
import com.techbuildding.demoTechBuildding.exception.ResourceNotFoundException;
import com.techbuildding.demoTechBuildding.repository.*;
import com.techbuildding.demoTechBuildding.service.NotificationService;
import com.techbuildding.demoTechBuildding.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionStepRepository submissionStepRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MaterialRequestRepository materialRequestRepository;
    private final RfiRepository rfiRepository;
    private final NotificationService notificationService;
    private final ProjectMemberRepository projectMemberRepository;

    public SubmissionServiceImpl(
            SubmissionRepository submissionRepository,
            SubmissionStepRepository submissionStepRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            MaterialRequestRepository materialRequestRepository,
            RfiRepository rfiRepository,
            NotificationService notificationService,
            ProjectMemberRepository projectMemberRepository) {
        this.submissionRepository = submissionRepository;
        this.submissionStepRepository = submissionStepRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.materialRequestRepository = materialRequestRepository;
        this.rfiRepository = rfiRepository;
        this.notificationService = notificationService;
        this.projectMemberRepository = projectMemberRepository;
    }

    @Override
    @Transactional
    public SubmissionResponseDTO createSubmission(SubmissionRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Submission submission = Submission.builder()
                .project(project)
                .title(request.getTitle())
                .submissionType(request.getSubmissionType())
                .referenceId(request.getReferenceId())
                .status("IN_PROGRESS")
                .currentStepIndex(0)
                .build();

        List<SubmissionStep> steps = request.getSteps().stream().map(stepReq -> 
            SubmissionStep.builder()
                .submission(submission)
                .stepName(stepReq.getStepName())
                .stepOrder(stepReq.getStepOrder())
                .assignedRole(stepReq.getAssignedRole())
                .status("PENDING")
                .build()
        ).collect(Collectors.toList());

        submission.setSteps(steps);
        Submission savedSubmission = submissionRepository.save(submission);
        
        // Sync initial status to reference
        updateReferenceStatus(savedSubmission);

        // Notify first step performers
        notifyStepPerformers(savedSubmission, 0);

        return mapToResponse(savedSubmission);
    }

    @Override
    @Transactional
    public SubmissionResponseDTO processStep(Long submissionId, Long stepId, SubmissionProcessRequestDTO request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        SubmissionStep step = submissionStepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("Step not found"));

        if (!step.getSubmission().getId().equals(submissionId)) {
            throw new IllegalArgumentException("Step does not belong to this submission");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User processor = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        step.setProcessor(processor);
        step.setStatus(request.getStatus());
        step.setComments(request.getComments());
        step.setProcessedAt(LocalDateTime.now());

        if (request.getSignature() != null) {
            DigitalSignature signature = DigitalSignature.builder()
                    .signer(processor)
                    .signatureType(request.getSignature().getSignatureType())
                    .signatureData(request.getSignature().getSignatureData())
                    .certificateSerial(request.getSignature().getCertificateSerial())
                    .signedAt(LocalDateTime.now())
                    .build();
            step.setSignature(signature);
        }

        // Logic to move to next step or finish
        if ("REJECTED".equals(request.getStatus())) {
            submission.setStatus("REJECTED");
        } else if ("APPROVED".equals(request.getStatus())) {
            int nextIndex = submission.getCurrentStepIndex() + 1;
            if (nextIndex >= submission.getSteps().size()) {
                submission.setStatus("APPROVED");
            } else {
                submission.setCurrentStepIndex(nextIndex);
                notifyStepPerformers(submission, nextIndex);
            }
        }

        Submission updatedSubmission = submissionRepository.save(submission);
        updateReferenceStatus(updatedSubmission);

        return mapToResponse(updatedSubmission);
    }

    private void updateReferenceStatus(Submission submission) {
        String type = submission.getSubmissionType();
        Long refId = submission.getReferenceId();
        String status = submission.getStatus();

        if ("MATERIAL_REQUEST".equals(type)) {
            materialRequestRepository.findById(refId.intValue()).ifPresent(mr -> {
                // Map Submission status to MaterialRequest status
                if ("APPROVED".equals(status)) mr.setStatus("APPROVED");
                else if ("REJECTED".equals(status)) mr.setStatus("REJECTED");
                else mr.setStatus("CHECKED"); // IN_PROGRESS means it's being checked
                materialRequestRepository.save(mr);
            });
        } else if ("RFI".equals(type)) {
            rfiRepository.findById(refId.intValue()).ifPresent(rfi -> {
                if ("APPROVED".equals(status)) rfi.setStatus("RESOLVED");
                else if ("REJECTED".equals(status)) rfi.setStatus("OPEN");
                rfiRepository.save(rfi);
            });
        }
    }

    private void notifyStepPerformers(Submission submission, int stepIndex) {
        if (stepIndex >= submission.getSteps().size()) return;
        
        SubmissionStep step = submission.getSteps().get(stepIndex);
        String role = step.getAssignedRole();
        Integer projectId = submission.getProject().getId();

        // Get members with this role in the project
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        
        for (ProjectMember member : members) {
            if (role.equals(member.getAssignedRole())) {
                notificationService.sendNotification(
                    member.getUser().getId().longValue(),
                    "Yêu cầu phê duyệt: " + submission.getTitle(),
                    "Hồ sơ " + submission.getSubmissionType() + " đang chờ bạn xử lý tại bước: " + step.getStepName(),
                    "INFO",
                    "/projects/" + projectId + "/submissions/" + submission.getId()
                );
            }
        }
    }

    @Override
    public SubmissionResponseDTO getSubmission(Long id) {
        return submissionRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }

    @Override
    public SubmissionResponseDTO getSubmissionByReference(String type, Long referenceId) {
        return submissionRepository.findBySubmissionTypeAndReferenceId(type, referenceId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    public List<SubmissionResponseDTO> getAllSubmissions() {
        return submissionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubmissionResponseDTO> getProjectSubmissions(Integer projectId) {
        return submissionRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SubmissionResponseDTO mapToResponse(Submission s) {
        return SubmissionResponseDTO.builder()
                .id(s.getId())
                .projectId(s.getProject().getId())
                .title(s.getTitle())
                .submissionType(s.getSubmissionType())
                .referenceId(s.getReferenceId())
                .status(s.getStatus())
                .currentStepIndex(s.getCurrentStepIndex())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .steps(s.getSteps().stream().map(this::mapToStepResponse).collect(Collectors.toList()))
                .build();
    }

    private SubmissionStepResponseDTO mapToStepResponse(SubmissionStep step) {
        return SubmissionStepResponseDTO.builder()
                .id(step.getId())
                .stepName(step.getStepName())
                .stepOrder(step.getStepOrder())
                .assignedRole(step.getAssignedRole())
                .status(step.getStatus())
                .comments(step.getComments())
                .processorId(step.getProcessor() != null ? step.getProcessor().getId().longValue() : null)
                .processorName(step.getProcessor() != null ? step.getProcessor().getFullName() : null)
                .processedAt(step.getProcessedAt())
                .signature(step.getSignature() != null ? DigitalSignatureResponseDTO.builder()
                        .id(step.getSignature().getId())
                        .signerId(step.getSignature().getSigner().getId().longValue())
                        .signerName(step.getSignature().getSigner().getFullName())
                        .signatureType(step.getSignature().getSignatureType())
                        .signatureData(step.getSignature().getSignatureData())
                        .signedAt(step.getSignature().getSignedAt())
                        .build() : null)
                .build();
    }
}
