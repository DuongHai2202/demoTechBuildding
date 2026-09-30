package com.techbuildding.demoTechBuildding.dto.request.shift;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Schema(description = "Approve one assigned shift for a late check-in with an audit reason")
public class LateCheckInApprovalRequestDTO implements Serializable {

    @NotBlank(message = "Lý do cho phép chấm công muộn là bắt buộc")
    @Size(max = 500, message = "Lý do không được vượt quá 500 ký tự")
    private String reason;
}
