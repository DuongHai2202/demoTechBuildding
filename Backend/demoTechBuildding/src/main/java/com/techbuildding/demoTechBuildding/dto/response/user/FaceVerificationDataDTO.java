package com.techbuildding.demoTechBuildding.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Browser verification data for the currently authenticated account only.
 * This is kept out of the general user profile response to avoid leaking
 * biometric templates to administrators or other accounts.
 */
@Getter
@AllArgsConstructor
public class FaceVerificationDataDTO {

    private final boolean registered;
    private final String descriptor;
}
