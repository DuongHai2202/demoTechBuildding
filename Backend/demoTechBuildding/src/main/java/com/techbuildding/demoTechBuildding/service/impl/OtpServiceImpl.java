package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.entity.User;
import com.techbuildding.demoTechBuildding.service.EmailService;
import com.techbuildding.demoTechBuildding.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

/**
 * Implementation of OtpService using Redis.
 *
 * OTP lifecycle:
 * 1. Generate 6-digit random code
 * 2. Save to Redis with key "otp:{userId}:{type}" and TTL 5 minutes
 * 3. Send OTP to user's email via EmailService
 * 4. User submits code via /api/v1/auth/verify-otp
 * 5. Verify: exists in Redis + matches → delete key (one-time use)
 *
 * Why Redis instead of MySQL?
 * - OTP is ephemeral data (only lives 5 minutes)
 * - Redis TTL auto-expires → no manual cleanup needed
 * - In-memory read/write → microsecond latency vs millisecond with MySQL
 * - No table bloat from expired OTP records
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final RedisTemplate<String, String> redisTemplate;
    private final EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final String OTP_KEY_PREFIX = "otp:";

    /**
     * Build Redis key: "otp:{userId}:{type}"
     * Example: "otp:5:REGISTER"
     */
    private String buildKey(Long userId, String type) {
        return OTP_KEY_PREFIX + userId + ":" + type;
    }

    @Override
    public String generateAndSaveOtp(User user, String type) {
        String code = generateRandomOtp();
        String key = buildKey(user.getId(), type);

        // Save to Redis with TTL = 5 minutes
        // When TTL expires, Redis automatically deletes the key → no cleanup needed
        redisTemplate.opsForValue().set(key, code, OTP_EXPIRY_MINUTES, TimeUnit.MINUTES);

        log.info("OTP saved to Redis: key={}, expires in {} minutes", key, OTP_EXPIRY_MINUTES);

        // Send OTP via email
        if (user.getEmail() != null) {
            emailService.sendOtpEmail(user.getEmail(), user.getUsername(), code);
        } else {
            log.warn("User {} has no email. OTP: {}", user.getUsername(), code);
        }

        return code;
    }

    @Override
    public boolean verifyOtp(Long userId, String otpCode, String type) {
        String key = buildKey(userId, type);

        // Get OTP from Redis (returns null if key doesn't exist or expired)
        String storedCode = redisTemplate.opsForValue().get(key);

        if (storedCode == null) {
            log.warn("No active OTP in Redis for key: {} (expired or not found)", key);
            return false;
        }

        // Check if code matches
        if (!storedCode.equals(otpCode)) {
            log.warn("OTP mismatch for key: {}", key);
            return false;
        }

        // Delete key after successful verification (one-time use)
        redisTemplate.delete(key);

        log.info("OTP verified and removed from Redis: key={}", key);
        return true;
    }

    /**
     * Generate a cryptographically secure random 6-digit OTP.
     */
    private String generateRandomOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
