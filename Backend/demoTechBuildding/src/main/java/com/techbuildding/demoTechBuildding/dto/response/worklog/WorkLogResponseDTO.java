package com.techbuildding.demoTechBuildding.dto.response.worklog;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class WorkLogResponseDTO implements Serializable {
    private Long id;
    private Integer projectId;
    private String projectName;
    private Long userId;
    private String username;
    private LocalDate logDate;
    private String weatherCondition;
    private Integer workerCount;
    private String content;
    private String status;
    private List<String> mediaUrls;
    
    // Approval auditing fields
    private String checkedByName;
    private String approvedByName;
    private java.time.LocalDateTime checkedAt;
    private java.time.LocalDateTime approvedAt;
    private String notes;
}
