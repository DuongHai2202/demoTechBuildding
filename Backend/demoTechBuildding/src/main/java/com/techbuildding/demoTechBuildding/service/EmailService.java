package com.techbuildding.demoTechBuildding.service;

/**
 * Service interface for sending emails.
 */
public interface EmailService {

    /**
     * Send OTP verification email to user.
     *
     * @param to       recipient email address
     * @param username username for greeting
     * @param otpCode  6-digit OTP code
     */
    void sendOtpEmail(String to, String username, String otpCode);
}
