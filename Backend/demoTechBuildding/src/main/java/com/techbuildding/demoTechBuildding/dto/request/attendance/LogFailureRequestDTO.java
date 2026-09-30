package com.techbuildding.demoTechBuildding.dto.request.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class LogFailureRequestDTO {

    @NotNull(message = "Người dùng không được để trống")
    private Long userId;

    @NotNull(message = "Dự án không được để trống")
    private Integer projectId;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @DecimalMin(value = "0.0", message = "Độ chính xác GPS không được âm")
    @DecimalMax(value = "10000.0", message = "Độ chính xác GPS không hợp lệ")
    private BigDecimal accuracy;

    @NotBlank(message = "Lý do thất bại không được để trống")
    private String reason;
}
