-- Keep minute counters compatible with the Long fields exposed by the
-- attendance domain and leave enough room for long-running audit data.
ALTER TABLE `tbl_attendance_logs`
  MODIFY COLUMN `late_minutes` BIGINT NULL,
  MODIFY COLUMN `early_leave_minutes` BIGINT NULL,
  MODIFY COLUMN `overtime_minutes` BIGINT NULL;
