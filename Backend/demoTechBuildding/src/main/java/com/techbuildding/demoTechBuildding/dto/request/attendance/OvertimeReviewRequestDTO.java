package com.techbuildding.demoTechBuildding.dto.request.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * Request used by an administrator or project manager to finalize a
 * calculated overtime amount. Partial approval is supported so the approved
 * number of minutes is always explicit and auditable.
 */
@Getter
@Setter
@Schema(description = "Duyệt hoặc từ chối số phút tăng ca đã được hệ thống tính")
public class OvertimeReviewRequestDTO implements Serializable {

    @NotBlank(message = "Trạng thái duyệt tăng ca là bắt buộc")
    @Pattern(regexp = "(?i)APPROVED|REJECTED", message = "Trạng thái tăng ca chỉ được là APPROVED hoặc REJECTED")
    private String status;

    @NotNull(message = "Số phút tăng ca được duyệt là bắt buộc")
    @Min(value = 0, message = "Số phút tăng ca được duyệt không được âm")
    private Long approvedMinutes;

    @Size(max = 500, message = "Ghi chú duyệt tăng ca không được vượt quá 500 ký tự")
    private String note;
}
