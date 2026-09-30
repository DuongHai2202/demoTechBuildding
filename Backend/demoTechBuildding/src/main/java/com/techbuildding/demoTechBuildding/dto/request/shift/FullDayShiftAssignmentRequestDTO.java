package com.techbuildding.demoTechBuildding.dto.request.shift;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

/** Assigns one continuous administrative workday: 08:00-17:30. */
@Getter
@Setter
@Schema(description = "Assign one full administrative day from 08:00 to 17:30")
public class FullDayShiftAssignmentRequestDTO implements Serializable {

    @NotNull(message = "Dự án là bắt buộc")
    private Integer projectId;

    @NotNull(message = "Nhân viên là bắt buộc")
    private Long userId;

    @NotNull(message = "Mẫu Full ca là bắt buộc")
    private Long shiftTemplateId;

    @NotNull(message = "Ngày làm việc là bắt buộc")
    private LocalDate workDate;

    private String notes;
}
