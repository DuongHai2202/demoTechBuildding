package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.entity.User;

/**
 * Service interface for OTP operations.
 */
public interface OtpService {

    /**
     * Generate a 6-digit OTP, save to database, and return the code.
     * In production, this would also send the OTP via email/SMS.
     */
    String generateAndSaveOtp(User user, String type);

    /**
     * Verify OTP code for a user. Checks:
     * - OTP exists
     * - OTP matches
     * - OTP is not expired
     * - OTP is not already used
     */
    boolean verifyOtp(Long userId, String otpCode, String type);
}
