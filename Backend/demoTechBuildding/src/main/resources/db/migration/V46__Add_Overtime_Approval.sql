-- Overtime is calculated from the scheduled end of an eligible shift, then
-- explicitly reviewed. Only approved minutes are authoritative for reports.
ALTER TABLE `tbl_shift_templates`
  ADD COLUMN `overtime_eligible` BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE `tbl_attendance_logs`
  ADD COLUMN `overtime_status` VARCHAR(20) NOT NULL DEFAULT 'NONE',
  ADD COLUMN `overtime_approved_minutes` BIGINT NULL,
  ADD COLUMN `overtime_reviewed_by` VARCHAR(50) NULL,
  ADD COLUMN `overtime_reviewed_at` DATETIME NULL,
  ADD COLUMN `overtime_review_note` VARCHAR(500) NULL,
  ADD INDEX `idx_attendance_overtime_status` (`overtime_status`);

-- Existing logs with calculated overtime must be reviewed before they affect
-- payroll/reporting. Logs without overtime remain finalized as NONE.
UPDATE `tbl_attendance_logs`
SET `overtime_status` = CASE
    WHEN COALESCE(`overtime_minutes`, 0) > 0 THEN 'PENDING'
    ELSE 'NONE'
  END,
  `overtime_approved_minutes` = 0;

-- Construction-site default: only afternoon and night shifts may generate an
-- overtime request. Morning work ends at 12:00 and is not overtime by itself.
UPDATE `tbl_shift_templates`
SET `overtime_eligible` = FALSE
WHERE `code` IN ('CA-HC', 'CA-SANG');

UPDATE `tbl_shift_templates`
SET `overtime_eligible` = TRUE
WHERE `code` IN ('CA-CHIEU', 'CA-DEM');
