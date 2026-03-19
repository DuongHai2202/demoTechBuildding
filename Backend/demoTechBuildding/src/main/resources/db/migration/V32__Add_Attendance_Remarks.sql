-- Add remarks column to tbl_attendance_logs
ALTER TABLE tbl_attendance_logs ADD COLUMN remarks VARCHAR(255);

-- Make status column slightly larger just in case
ALTER TABLE tbl_attendance_logs MODIFY COLUMN status VARCHAR(50);

-- Add index on status for faster filtering
CREATE INDEX idx_attendance_status ON tbl_attendance_logs(status);
