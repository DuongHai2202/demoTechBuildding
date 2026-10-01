-- Keep manual attendance corrections traceable without changing an applied migration.
ALTER TABLE tbl_attendance_logs
    ADD COLUMN correction_reason VARCHAR(500) NULL,
    ADD COLUMN corrected_by VARCHAR(50) NULL,
    ADD COLUMN corrected_at DATETIME NULL;
