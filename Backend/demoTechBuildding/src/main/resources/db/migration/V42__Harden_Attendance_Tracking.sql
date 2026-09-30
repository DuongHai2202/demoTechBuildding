-- Store the location quality and check-out geofence evidence for attendance audits.
ALTER TABLE tbl_attendance_logs
    ADD COLUMN distance_out_meters FLOAT NULL,
    ADD COLUMN gps_accuracy_in DOUBLE NULL,
    ADD COLUMN gps_accuracy_out DOUBLE NULL;

CREATE INDEX idx_attendance_user_checkin
    ON tbl_attendance_logs(user_id, check_in_at);

CREATE INDEX idx_attendance_project_checkin
    ON tbl_attendance_logs(project_id, check_in_at);
