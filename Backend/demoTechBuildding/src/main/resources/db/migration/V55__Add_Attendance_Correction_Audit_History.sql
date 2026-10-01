-- Keep every manual attendance correction for later reconciliation.
CREATE TABLE IF NOT EXISTS `tbl_attendance_correction_audits` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `attendance_id` BIGINT NOT NULL,
  `previous_status` VARCHAR(20) NOT NULL,
  `new_status` VARCHAR(20) NOT NULL,
  `previous_check_in_at` DATETIME NULL,
  `previous_check_out_at` DATETIME NULL,
  `new_check_in_at` DATETIME NULL,
  `new_check_out_at` DATETIME NULL,
  `reason` VARCHAR(500) NOT NULL,
  `corrected_by` VARCHAR(50) NOT NULL,
  `corrected_at` DATETIME NOT NULL,
  `created_by` VARCHAR(50) NULL,
  `updated_by` VARCHAR(50) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  CONSTRAINT `fk_attendance_correction_audit_log`
    FOREIGN KEY (`attendance_id`) REFERENCES `tbl_attendance_logs`(`id`)
    ON DELETE CASCADE,
  INDEX `idx_attendance_correction_audit_log` (`attendance_id`, `corrected_at`)
);
