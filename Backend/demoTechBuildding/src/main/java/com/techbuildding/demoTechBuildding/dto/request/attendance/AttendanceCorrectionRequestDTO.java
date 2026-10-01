package com.techbuildding.demoTechBuildding.dto.request.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Controlled correction request for an administrator or project manager.
 * A correction is explicit and always carries a business reason.
 */
@Getter
@Setter
@Schema(description = "Điều chỉnh có kiểm soát một lượt chấm công sau khi đã chốt")
public class AttendanceCorrectionRequestDTO implements Serializable {

    @NotBlank(message = "Trạng thái điều chỉnh là bắt buộc")
    @Pattern(regexp = "(?i)COMPLETED|ABSENT",
            message = "Trạng thái điều chỉnh chỉ được là COMPLETED hoặc ABSENT")
    @Schema(description = "Trạng thái sau điều chỉnh", example = "COMPLETED")
    private String status;

    @Schema(description = "Thời điểm vào mới; bỏ trống để giữ thời điểm hiện tại")
    private LocalDateTime checkInAt;

    @Schema(description = "Thời điểm ra; bắt buộc khi điều chỉnh thành COMPLETED")
    private LocalDateTime checkOutAt;

    @NotBlank(message = "Lý do điều chỉnh là bắt buộc")
    @Size(min = 10, max = 500, message = "Lý do điều chỉnh phải từ 10 đến 500 ký tự")
    @Schema(description = "Lý do nghiệp vụ để lưu audit", example = "Nhân viên quên checkout, đã xác minh bảng công trường.")
    private String reason;
}
