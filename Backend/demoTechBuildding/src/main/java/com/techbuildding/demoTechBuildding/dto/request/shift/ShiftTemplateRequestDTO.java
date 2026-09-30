package com.techbuildding.demoTechBuildding.dto.request.shift;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalTime;

@Getter
@Setter
@Schema(description = "Reusable work shift definition")
public class ShiftTemplateRequestDTO implements Serializable {

    @Schema(description = "Optional project scope; null means reusable globally")
    private Integer projectId;

    @NotBlank(message = "Mã ca không được để trống")
    private String code;

    @NotBlank(message = "Tên ca không được để trống")
    private String name;

    @NotNull(message = "Giờ bắt đầu là bắt buộc")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc là bắt buộc")
    private LocalTime endTime;

    private boolean crossesMidnight;

    @Min(value = 0, message = "Thời gian nghỉ không được âm")
    @Max(value = 720, message = "Thời gian nghỉ không hợp lệ")
    private Integer breakMinutes = 0;

    @Min(value = 0, message = "Khoảng chấm sớm không được âm")
    @Max(value = 720, message = "Khoảng chấm sớm không hợp lệ")
    private Integer earlyCheckInMinutes = 30;

    @Min(value = 0, message = "Khoảng chấm muộn không được âm")
    @Max(value = 1440, message = "Khoảng chấm muộn không hợp lệ")
    private Integer lateCheckInMinutes = 120;

    @Schema(description = "Bật xét tăng ca cho khung hành chính; hệ thống vẫn bắt buộc đủ ca hành chính, không áp dụng cho ca đêm hoặc ca một buổi")
    private boolean overtimeEligible = true;
}
