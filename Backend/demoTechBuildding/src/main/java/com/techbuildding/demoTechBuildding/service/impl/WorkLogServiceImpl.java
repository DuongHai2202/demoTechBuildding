package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.worklog.WorkLogRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.worklog.WorkLogResponseDTO;
import com.techbuildding.demoTechBuildding.entity.MediaAttachment;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.entity.WorkLog;
import com.techbuildding.demoTechBuildding.mapper.WorkLogMapper;
import com.techbuildding.demoTechBuildding.repository.MediaAttachmentRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.UserRepository;
import com.techbuildding.demoTechBuildding.repository.WorkLogRepository;
import com.techbuildding.demoTechBuildding.service.StorageService;
import com.techbuildding.demoTechBuildding.service.WorkLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkLogServiceImpl implements WorkLogService {

    private final WorkLogRepository workLogRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MediaAttachmentRepository mediaAttachmentRepository;
    private final StorageService storageService;
    private final WorkLogMapper workLogMapper;

    @Override
    @Transactional
    public WorkLogResponseDTO createLog(WorkLogRequestDTO request, List<MultipartFile> files) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // Retrieve current authenticated user
        String username;
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> {
                    return userRepository.findById(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found: " + username));
                });

        WorkLog workLog = workLogMapper.toEntity(request);
        workLog.setProject(project);
        workLog.setUser(user);
        WorkLog savedLog = workLogRepository.save(workLog);

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String url = storageService.uploadFile(file, "site-logs");
                MediaAttachment media = MediaAttachment.builder()
                        .workLog(savedLog)
                        .fileUrl(url)
                        .fileType(file.getContentType())
                        .build();
                mediaAttachmentRepository.save(media);
            }
        }

        return getLogById(savedLog.getId());
    }

    @Override
    public WorkLogResponseDTO getLogById(Long logId) {
        WorkLog log = workLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("WorkLog not found"));
        WorkLogResponseDTO dto = workLogMapper.toResponseDTO(log);

        List<String> urls = mediaAttachmentRepository.findByWorkLogId(logId)
                .stream().map(MediaAttachment::getFileUrl).collect(Collectors.toList());
        dto.setMediaUrls(urls);

        return dto;
    }

    @Override
    public List<WorkLogResponseDTO> getLogsByProject(Integer projectId) {
        return workLogRepository.findByProjectId(projectId).stream()
                .map(log -> getLogById(log.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkLogResponseDTO> getAllLogs() {
        return workLogRepository.findAll().stream()
                .map(log -> getLogById(log.getId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteLog(Long logId) {
        workLogRepository.deleteById(logId);
    }

    @Override
    @Transactional
    public WorkLogResponseDTO checkLog(Long id, Long userId, String notes) {
        WorkLog log = workLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkLog not found"));
        
        String username = getAuthenticatedUsername();
        User auditor = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username)));

        log.setStatus("CHECKED");
        log.setCheckedBy(auditor);
        log.setCheckedAt(java.time.LocalDateTime.now());
        if (notes != null) log.setNotes(notes);

        return getLogById(workLogRepository.save(log).getId());
    }

    @Override
    @Transactional
    public WorkLogResponseDTO approveLog(Long id, Long userId, String notes) {
        WorkLog log = workLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkLog not found"));

        String username = getAuthenticatedUsername();
        User auditor = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username)));

        log.setStatus("APPROVED");
        log.setApprovedBy(auditor);
        log.setApprovedAt(java.time.LocalDateTime.now());
        if (notes != null) log.setNotes(notes);

        return getLogById(workLogRepository.save(log).getId());
    }

    @Override
    @Transactional
    public WorkLogResponseDTO rejectLog(Long id, Long userId, String notes) {
        WorkLog log = workLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkLog not found"));

        log.setStatus("REJECTED");
        if (notes != null) log.setNotes(notes);

        return getLogById(workLogRepository.save(log).getId());
    }

    private String getAuthenticatedUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
}
