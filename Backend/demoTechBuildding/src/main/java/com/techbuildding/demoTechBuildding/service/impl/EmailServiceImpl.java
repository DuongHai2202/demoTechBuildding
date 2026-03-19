package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email service implementation using Spring Mail + Gmail SMTP.
 *
 * Uses @Async so email sending does not block the API response.
 * The OTP email is sent as HTML with a professional template.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String emailFrom;

    @Async
    @Override
    public void sendOtpEmail(String to, String username, String otpCode) {
        log.info("Sending OTP email to: {}", to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(emailFrom, "Tech Building");

            helper.setTo(to);
            helper.setSubject("TechBuilding - Verify Your Account");
            helper.setText(buildOtpEmailHtml(username, otpCode), true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("CRITICAL: Failed to send OTP email to: {}. Error type: {}, Message: {}", 
                to, e.getClass().getSimpleName(), e.getMessage());
            // We throw a runtime exception but since it's @Async, it won't block the user.
            // The logs will be the primary diagnostic tool.
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    /**
     * Build HTML email template for OTP verification.
     */
    private String buildOtpEmailHtml(String username, String otpCode) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <div style="background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">TechBuilding</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
                        <p>Hello <strong>%s</strong>,</p>
                        <p>Your verification code is:</p>
                        <div style="background: #fff; border: 2px dashed #1a73e8; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a73e8;">%s</span>
                        </div>
                        <p>This code will expire in <strong>5 minutes</strong>.</p>
                        <p style="color: #666; font-size: 12px;">If you did not request this code, please ignore this email.</p>
                    </div>
                </div>
                """
                .formatted(username, otpCode);
    }
}
