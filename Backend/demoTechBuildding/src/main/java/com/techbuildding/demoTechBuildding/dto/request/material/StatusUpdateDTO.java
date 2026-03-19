package com.techbuildding.demoTechBuildding.dto.request.material;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class StatusUpdateDTO implements Serializable {
    private String status;
}
