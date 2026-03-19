-- Add GUEST role to tbl_roles
INSERT INTO `tbl_roles` (`name`, `description`, `created_by`, `created_at`) 
VALUES ('GUEST', 'Mặc định khi đăng ký mới, cần xin quyền để truy cập hệ thống', 'SYSTEM', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Create tbl_role_requests for permissions request flow
CREATE TABLE `tbl_role_requests` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `requested_role_id` INT NOT NULL,
  `reason` TEXT,
  `status` VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  `admin_note` TEXT,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`requested_role_id`) REFERENCES `tbl_roles`(`id`) ON DELETE CASCADE
);
