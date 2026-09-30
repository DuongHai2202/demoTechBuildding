-- A manager can authorize a late check-in for one concrete assignment.
-- This is scoped and auditable; it does not change the global 30-minute rule.
ALTER TABLE `tbl_shift_assignments`
  ADD COLUMN `late_checkin_approved` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `late_checkin_approved_by` BIGINT NULL,
  ADD COLUMN `late_checkin_approved_at` DATETIME NULL,
  ADD COLUMN `late_checkin_approval_note` VARCHAR(500) NULL,
  ADD CONSTRAINT `fk_shift_assignment_late_checkin_approved_by`
    FOREIGN KEY (`late_checkin_approved_by`) REFERENCES `tbl_users`(`id`) ON DELETE SET NULL;

CREATE INDEX `idx_shift_assignment_late_checkin`
  ON `tbl_shift_assignments` (`user_id`, `work_date`, `late_checkin_approved`);
