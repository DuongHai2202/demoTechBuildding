-- Explicit shift planning. Attendance rows keep a nullable snapshot link so
-- existing history remains valid while future check-ins can require a shift.
CREATE TABLE `tbl_shift_templates` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(120) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `crosses_midnight` BOOLEAN NOT NULL DEFAULT FALSE,
  `break_minutes` INT NOT NULL DEFAULT 0,
  `early_check_in_minutes` INT NOT NULL DEFAULT 30,
  `late_check_in_minutes` INT NOT NULL DEFAULT 120,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_shift_template_project` FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE SET NULL,
  INDEX `idx_shift_template_scope` (`project_id`, `status`)
);

CREATE TABLE `tbl_shift_assignments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `shift_template_id` BIGINT NOT NULL,
  `project_id` INT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `work_date` DATE NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED',
  `notes` VARCHAR(500),
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_shift_assignment_template` FOREIGN KEY (`shift_template_id`) REFERENCES `tbl_shift_templates`(`id`),
  CONSTRAINT `fk_shift_assignment_project` FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_shift_assignment_user` FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `uq_shift_assignment` UNIQUE (`project_id`, `user_id`, `shift_template_id`, `work_date`),
  INDEX `idx_shift_assignment_user_date` (`user_id`, `work_date`, `status`),
  INDEX `idx_shift_assignment_project_date` (`project_id`, `work_date`, `status`)
);

ALTER TABLE `tbl_attendance_logs`
  ADD COLUMN `shift_assignment_id` BIGINT NULL,
  ADD COLUMN `scheduled_start_at` DATETIME NULL,
  ADD COLUMN `scheduled_end_at` DATETIME NULL,
  ADD COLUMN `break_minutes` INT NULL,
  ADD COLUMN `late_minutes` INT NULL,
  ADD COLUMN `early_leave_minutes` INT NULL,
  ADD COLUMN `overtime_minutes` INT NULL,
  ADD CONSTRAINT `fk_attendance_shift_assignment` FOREIGN KEY (`shift_assignment_id`) REFERENCES `tbl_shift_assignments`(`id`) ON DELETE SET NULL,
  ADD INDEX `idx_attendance_shift_assignment` (`shift_assignment_id`);

-- Default templates make the demo usable immediately. Managers can create
-- project-specific templates later through the API without changing history.
INSERT INTO `tbl_shift_templates`
  (`code`, `name`, `start_time`, `end_time`, `crosses_midnight`, `break_minutes`, `early_check_in_minutes`, `late_check_in_minutes`, `status`, `created_by`, `updated_by`)
VALUES
  ('CA-HC', 'Ca hành chính', '08:00:00', '17:30:00', FALSE, 90, 30, 120, 'ACTIVE', 'SYSTEM', 'SYSTEM'),
  ('CA-SANG', 'Ca sáng', '06:00:00', '14:00:00', FALSE, 30, 30, 120, 'ACTIVE', 'SYSTEM', 'SYSTEM'),
  ('CA-CHIEU', 'Ca chiều', '14:00:00', '22:00:00', FALSE, 30, 30, 120, 'ACTIVE', 'SYSTEM', 'SYSTEM'),
  ('CA-DEM', 'Ca đêm', '22:00:00', '06:00:00', TRUE, 30, 30, 120, 'ACTIVE', 'SYSTEM', 'SYSTEM');

-- Give active project members a current demo assignment once. This is only
-- bootstrap data; future dates are managed through the assignment API.
INSERT IGNORE INTO `tbl_shift_assignments`
  (`shift_template_id`, `project_id`, `user_id`, `work_date`, `status`, `notes`, `created_by`, `updated_by`)
SELECT st.`id`, pm.`project_id`, pm.`user_id`, CURRENT_DATE, 'ASSIGNED', 'Ca demo khởi tạo tự động', 'SYSTEM', 'SYSTEM'
FROM `tbl_shift_templates` st
JOIN `tbl_project_members` pm ON pm.`is_active` = TRUE
WHERE st.`code` = 'CA-CHIEU';
