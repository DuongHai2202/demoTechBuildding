package com.techbuildding.demoTechBuildding.dto.request.contract;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractWorkflowTransitionRequestDTO {

    @NotNull(message = "Bước đích là bắt buộc")
    @Min(value = 1, message = "Bước đích phải từ 1 đến 7")
    @Max(value = 7, message = "Bước đích phải từ 1 đến 7")
    private Integer targetStep;

    private String note;
}
