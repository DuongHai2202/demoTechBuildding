-- =========================================================
-- V30: Reset all user-related data
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `tbl_role_requests`;
TRUNCATE TABLE `tbl_notifications`;
TRUNCATE TABLE `tbl_attendance_logs`;
TRUNCATE TABLE `tbl_user_has_roles`;
TRUNCATE TABLE `tbl_project_members`;

-- Finally clear users
TRUNCATE TABLE `tbl_users`;

SET FOREIGN_KEY_CHECKS = 1;
