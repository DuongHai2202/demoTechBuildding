package com.techbuildding.demoTechBuildding.dto.request.attendance;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Admin-only clock override used by the local/demo environment. The value is
 * deliberately server-side; attendance requests never accept a client-supplied
 * check-in or check-out timestamp.
 */
@Getter
@Setter
@NoArgsConstructor
public class AttendanceDemoClockRequestDTO {

    @NotNull(message = "Vui lòng chọn thời gian demo.")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime demoTime;

    @NotNull(message = "Vui lòng chọn trạng thái đồng hồ demo.")
    private Boolean enabled;
}
