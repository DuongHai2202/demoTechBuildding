-- Business rule: a check-in is accepted for at most 30 minutes after the
-- scheduled start. Existing templates created with the old 120-minute default
-- are normalized so the database and application use the same policy.
UPDATE `tbl_shift_templates`
SET `late_check_in_minutes` = LEAST(COALESCE(`late_check_in_minutes`, 30), 30);

ALTER TABLE `tbl_shift_templates`
  MODIFY COLUMN `late_check_in_minutes` INT NOT NULL DEFAULT 30;
