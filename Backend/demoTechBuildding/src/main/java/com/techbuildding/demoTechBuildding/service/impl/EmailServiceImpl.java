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

    @Value("${spring.mail.from:${spring.mail.username:}}")
    private String emailFrom;

    @Async
    @Override
    public void sendOtpEmail(String to, String username, String otpCode) {
        log.info("Đang chuẩn bị gửi email OTP đến: {}", to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String sender = (emailFrom != null && !emailFrom.isBlank()) ? emailFrom : "noreply@techbuilding.com";
            helper.setFrom(sender, "TechBuilding");
            helper.setTo(to);
            helper.setSubject("TechBuilding - Mã xác thực tài khoản (OTP)");
            helper.setText(buildOtpEmailHtml(username, otpCode), true);

            mailSender.send(message);
            log.info("Gửi email OTP thành công đến: {}", to);

        } catch (Exception e) {
            log.error("CRITICAL: Không thể gửi email OTP đến '{}' qua Gmail SMTP. Lỗi [{}]: {}",
                to, e.getClass().getSimpleName(), e.getMessage());
            log.warn("""

                ================================================================================
                [DEV FALLBACK - XÁC THỰC TÀI KHOẢN]
                -> Người nhận: {} (Tài khoản: {})
                -> MÃ OTP XÁC THỰC LÀ: [{}]
                -> Nhập mã này trên giao diện xác thực để kích hoạt tài khoản.
                (Lưu ý: Để gửi email thật, vui lòng cấu hình Mật khẩu ứng dụng Gmail hợp lệ)
                ================================================================================
                """, to, username, otpCode);
        }
    }

    /**
     * Build HTML email template for OTP verification.
     */
    private String buildOtpEmailHtml(String username, String otpCode) {
        return """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 25px; background-color: #f4f6f8;">
                    <div style="background: linear-gradient(135deg, #1e3c72 0%%, #2a5298 100%%); color: white; padding: 28px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h2 style="margin: 0; font-size: 24px; letter-spacing: 1px;">TechBuilding System</h2>
                        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Hệ Thống Quản Lý Tòa Nhà & Nhân Sự</p>
                    </div>
                    <div style="background: #ffffff; padding: 32px 28px; border: 1px solid #e1e4e8; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.03);">
                        <p style="font-size: 16px; color: #333; margin-top: 0;">Xin chào <strong>%s</strong>,</p>
                        <p style="font-size: 14px; color: #555; line-height: 1.6;">
                            Cảm ơn bạn đã đăng ký tài khoản tại hệ thống <strong>TechBuilding</strong>. Dưới đây là mã xác thực một lần (OTP) để hoàn tất đăng ký:
                        </p>
                        <div style="background: #f0f4ff; border: 2px dashed #2a5298; padding: 18px; text-align: center; margin: 24px 0; border-radius: 8px;">
                            <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #1e3c72; font-family: monospace;">%s</span>
                        </div>
                        <p style="font-size: 13px; color: #e65100; font-weight: 500;">
                            * Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong>.
                        </p>
                        <p style="font-size: 13px; color: #777; line-height: 1.5;">
                            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với ban quản trị.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;">
                        <p style="text-align: center; color: #999; font-size: 12px; margin: 0;">
                            © 2026 TechBuilding Platform. All rights reserved.
                        </p>
                    </div>
                </div>
                """
                .formatted(username, otpCode);
    }
}
