-- =========================================================
-- SCRIPT KHỞI TẠO DATABASE TECHBUILDING (MYSQL 8.0)
-- BẢN V3: RBAC & Audit Enhanced - Table Prefix (tbl_)
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `tbl_boq_items`, `tbl_contracts`, `tbl_material_requests`, `tbl_materials`, `tbl_media_attachments`, `tbl_work_logs`, `tbl_attendance_logs`, `tbl_project_members`, `tbl_projects`, `tbl_otp_codes`, `tbl_blacklisted_tokens`, `tbl_refresh_tokens`, `tbl_role_has_permissions`, `tbl_user_has_roles`, `tbl_permissions`, `tbl_roles`, `tbl_users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --- 1. NHÓM PHÂN QUYỀN & BẢO MẬT (AUTH & RBAC) ---
CREATE TABLE `tbl_roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) UNIQUE NOT NULL,
  `description` TEXT,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) UNIQUE NOT NULL,
  `description` TEXT,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100),
  `phone` VARCHAR(15) UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `device_id` VARCHAR(100),
  `avatar_url` VARCHAR(255),
  `status` VARCHAR(20) DEFAULT 'ACTIVE',
  `is_deleted` BOOLEAN DEFAULT FALSE,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_user_has_roles` (
  `user_id` BIGINT NOT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `tbl_roles`(`id`) ON DELETE CASCADE
);

CREATE TABLE `tbl_role_has_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `tbl_roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `tbl_permissions`(`id`) ON DELETE CASCADE
);

CREATE TABLE `tbl_refresh_tokens` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `user_id` BIGINT NOT NULL,
  `expiry_date` TIMESTAMP NOT NULL,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `tbl_blacklisted_tokens` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `token` VARCHAR(500) UNIQUE NOT NULL,
  `expiry_date` TIMESTAMP NOT NULL,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_otp_codes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `code` VARCHAR(6) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `is_used` BOOLEAN DEFAULT FALSE,
  `expired_at` TIMESTAMP NOT NULL,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`) ON DELETE CASCADE
);

-- --- 2. NHÓM QUẢN LÝ DỰ ÁN (PROJECTS) ---
CREATE TABLE `tbl_projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `address` VARCHAR(500),
  `latitude` DECIMAL(10,8),
  `longitude` DECIMAL(11,8),
  `radius_meters` INT DEFAULT 100,
  `start_date` DATE,
  `end_date` DATE,
  `status` VARCHAR(20) DEFAULT 'PLANNING',
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_project_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `assigned_role` VARCHAR(50),
  `is_active` BOOLEAN DEFAULT TRUE,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(`project_id`, `user_id`),
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`) ON DELETE CASCADE
);

-- --- 3. NHÓM CHẤM CÔNG (ATTENDANCE) ---
CREATE TABLE `tbl_attendance_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `project_id` INT NOT NULL,
  `check_in_at` TIMESTAMP NULL,
  `check_out_at` TIMESTAMP NULL,
  `gps_lat_in` DECIMAL(10,8),
  `gps_long_in` DECIMAL(11,8),
  `gps_lat_out` DECIMAL(10,8),
  `gps_long_out` DECIMAL(11,8),
  `distance_in_meters` FLOAT,
  `selfie_url_in` VARCHAR(255),
  `selfie_url_out` VARCHAR(255),
  `status` VARCHAR(20),
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`),
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`)
);

-- --- 4. NHÓM NHẬT KÝ & HIỆN TRƯỜNG (SITE LOGS) ---
CREATE TABLE `tbl_work_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `log_date` DATE NOT NULL,
  `weather_condition` VARCHAR(100),
  `worker_count` INT DEFAULT 0,
  `content` TEXT,
  `status` VARCHAR(20) DEFAULT 'DRAFT',
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`)
);

CREATE TABLE `tbl_media_attachments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `log_id` BIGINT NOT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(20),
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`log_id`) REFERENCES `tbl_work_logs`(`id`) ON DELETE CASCADE
);

-- --- 5. NHÓM VẬT TƯ & KHO (PROCUREMENT) ---
CREATE TABLE `tbl_materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `unit` VARCHAR(20),
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `tbl_material_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `requester_id` BIGINT NOT NULL,
  `material_id` INT NOT NULL,
  `requested_quantity` FLOAT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'PENDING',
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`),
  FOREIGN KEY (`requester_id`) REFERENCES `tbl_users`(`id`),
  FOREIGN KEY (`material_id`) REFERENCES `tbl_materials`(`id`)
);

-- --- 6. NHÓM HỢP ĐỒNG (CONTRACTS) ---
CREATE TABLE `tbl_contracts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `contract_number` VARCHAR(100) UNIQUE NOT NULL,
  `contract_name` VARCHAR(255),
  `partner_name` VARCHAR(255),
  `contract_value` DECIMAL(18,2),
  `status` VARCHAR(20) DEFAULT 'ACTIVE',
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`)
);

CREATE TABLE `tbl_boq_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contract_id` INT NOT NULL,
  `item_code` VARCHAR(50),
  `description` TEXT,
  `unit` VARCHAR(20),
  `quantity` FLOAT,
  `unit_price` DECIMAL(18,2),
  `total_price` DECIMAL(18,2),
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`contract_id`) REFERENCES `tbl_contracts`(`id`) ON DELETE CASCADE
);
