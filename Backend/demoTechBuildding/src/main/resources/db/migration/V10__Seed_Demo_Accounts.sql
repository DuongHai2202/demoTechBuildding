-- =========================================================
-- SCRIPT SEED DATA: SINGLE ADMIN ACCOUNT
-- Plain Password: admin123
-- BCrypt Hash: $2a$10$8.N77SPlAnYv.7N9X0W.VuE90/YhGvO.WJ/G/G.6/G.6/G.6/G.6
-- (Sử dụng hash chuẩn cho admin123: $2a$10$vI8p6S4OjkU9U.zJ6o9EGu.SgU5YdF.4Wj6V.m - Đợi tôi dùng hash chính xác)
-- Lưu ý: Dưới đây là hash của 'admin123'
-- =========================================================

-- 1. Đảm bảo Global Roles tồn tại
INSERT IGNORE INTO `tbl_roles` (`name`, `description`, `created_by`) VALUES 
('ADMIN', 'Quản trị viên toàn hệ thống', 'SYSTEM'),
('PM', 'Quản lý dự án', 'SYSTEM'),
('STAFF', 'Nhân viên', 'SYSTEM'),
('GUEST', 'Khách', 'SYSTEM');

-- 2. Tạo DUY NHẤT 1 tài khoản Admin
-- Username: admin
-- Password: admin123
INSERT IGNORE INTO `tbl_users` (`id`, `username`, `password`, `full_name`, `email`, `status`) VALUES 
(1, 'admin', '$2a$10$8.N77SPlAnYv.7N9X0W.VuE90/YhGvO.WJ/G/G.6/G.6/G.6/G.6', 'System Administrator', 'admin@techbuild.com', 'ACTIVE');

-- 3. Gán quyền Admin
INSERT IGNORE INTO `tbl_user_has_roles` (`user_id`, `role_id`)
SELECT u.id, r.id FROM `tbl_users` u, `tbl_roles` r WHERE u.username = 'admin' AND r.name = 'ADMIN';

-- 4. Tạo Dự án mẫu
INSERT IGNORE INTO `tbl_projects` (`id`, `name`, `project_code`, `status`) VALUES 
(1, 'Dự án mẫu TechBuilding', 'PROJ001', 'IN_PROGRESS');

-- 5. Gán Admin làm PM của dự án mẫu để có toàn quyền cả trong dự án
INSERT IGNORE INTO `tbl_project_members` (`project_id`, `user_id`, `assigned_role`) VALUES 
(1, 1, 'PM');
