package com.techbuildding.demoTechBuildding.dto.response.project;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for returning project information.
 */
@Getter
@Setter
public class ProjectResponseDTO implements Serializable {

    private Integer id;
    private String name;
    private String projectCode;
    private String description;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer radiusMeters;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private LocalDateTime createdAt;
}
