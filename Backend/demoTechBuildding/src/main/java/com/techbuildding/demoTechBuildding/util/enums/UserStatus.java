package com.techbuildding.demoTechBuildding.util.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum UserStatus {
    @JsonProperty("active")
    ACTIVE,
    @JsonProperty("inactive")
    INACTIVE,
    @JsonProperty("pending")
    PENDING,
    @JsonProperty("locked")
    LOCKED
}
