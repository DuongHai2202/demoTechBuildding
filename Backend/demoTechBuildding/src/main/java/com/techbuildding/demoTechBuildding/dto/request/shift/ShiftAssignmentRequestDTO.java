package com.techbuildding.demoTechBuildding.dto.request.shift;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@Schema(description = "Assign a shift to a project member for one work date")
public class ShiftAssignmentRequestDTO implements Serializable {

    @NotNull(message = "Dự án là bắt buộc")
    private Integer projectId;

    @NotNull(message = "Nhân viên là bắt buộc")
    private Long userId;

    @NotNull(message = "Mẫu ca là bắt buộc")
    private Long shiftTemplateId;

    @NotNull(message = "Ngày làm việc là bắt buộc")
    private LocalDate workDate;

    private String notes;
}
