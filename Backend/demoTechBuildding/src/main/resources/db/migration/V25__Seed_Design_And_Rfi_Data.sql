-- V25__Seed_Design_And_Rfi_Data.sql
-- =========================================================
-- V25: Seed natural data for Design Sheets and RFIs
-- =========================================================

-- 1. Seed Design Sheets for Project 1 (Dự án mẫu TechBuilding)
INSERT INTO `tbl_design_sheets` (`project_id`, `zone_id`, `sheet_number`, `title`, `discipline`, `revision`, `status`, `file_url`, `issued_at`, `issued_by`, `created_at`) VALUES
(1, 12, 'A-101', 'Mặt bằng tổng thể tầng 1 - Block A', 'ARCH', '01', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-01', 1, NOW()),
(1, 12, 'A-102', 'Mặt bằng tầng 2 - Khu văn phòng', 'ARCH', '00', 'FOR_REVIEW', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-10', 1, NOW()),
(1, 12, 'S-101', 'Chi tiết kết cấu móng Block A', 'STRUC', '00', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-02-15', 1, NOW()),
(1, 13, 'A-101', 'Mặt bằng tầng 1 - Block B', 'ARCH', '00', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-05', 1, NOW()),
(1, NULL, 'ME-101', 'Sơ đồ nguyên lý cấp điện tổng', 'MEP', '01', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-12', 1, NOW());

-- 2. Seed Design Sheets for Project 2 (Landmark Tower)
INSERT INTO `tbl_design_sheets` (`project_id`, `zone_id`, `sheet_number`, `title`, `discipline`, `revision`, `status`, `file_url`, `issued_at`, `issued_by`, `created_at`) VALUES
(2, 2, 'LT-ARCH-01', 'Mặt đứng chính tòa tháp Landmark', 'ARCH', '02', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-01-20', 1, NOW()),
(2, 2, 'LT-STR-01', 'Chi tiết cột vách khối đế', 'STRUC', '01', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-01-25', 1, NOW()),
(2, 4, 'LT-MEP-15', 'Mặt bằng bố trí thiết bị tầng kỹ thuật 15', 'MEP', '00', 'PRELIMINARY', 'https://www.africau.edu/images/default/sample.pdf', '2026-02-28', 1, NOW());

-- 3. Seed RFIs for Project 1
-- RFI 1: Sai khác vị trí hộp kỹ thuật
INSERT INTO `tbl_rfis` (`project_id`, `title`, `question`, `suggested_solution`, `status`, `assigned_to`, `design_sheet_id`, `coord_x`, `coord_y`, `created_at`) 
SELECT 1, 'Sai khác vị trí hộp kỹ thuật trục A-2', 'Theo bản vẽ ARCH A-101 hộ kỹ thuật nằm cách trục A là 500mm, nhưng thực tế MB tầng 1 đang để 700mm. Đề nghị làm rõ.', 'Điều chỉnh theo thực tế 700mm để tránh vướng dầm.', 'OPEN', 1, id, 150.5, 200.0, NOW()
FROM `tbl_design_sheets` WHERE `sheet_number` = 'A-101' AND `project_id` = 1 AND `zone_id` = 12 LIMIT 1;

-- RFI 2: Chủng loại thép tăng cường dầm D1
INSERT INTO `tbl_rfis` (`project_id`, `title`, `question`, `suggested_solution`, `status`, `assigned_to`, `design_sheet_id`, `created_at`) 
SELECT 1, 'Chủng loại thép tăng cường dầm D1', 'Bản vẽ S-101 chưa thể hiện rõ thép tăng cường tại gối dầm D1 là D20 hay D22.', 'Sử dụng D22 cho đồng bộ với dầm chính.', 'PENDING', 1, id, NOW()
FROM `tbl_design_sheets` WHERE `sheet_number` = 'S-101' AND `project_id` = 1 LIMIT 1;

-- 4. Seed RFIs for Project 2
-- RFI 3: Cao độ hoàn thiện sàn sảnh chính
INSERT INTO `tbl_rfis` (`project_id`, `title`, `question`, `suggested_solution`, `status`, `assigned_to`, `created_at`) 
VALUES (2, 'Làm rõ cao độ hoàn thiện sàn sảnh chính', 'Cao độ hoàn thiện sảnh chính Landmark Tower trong TKCS là +0.450 nhưng hồ sơ nội thất lại để +0.500.', 'Thống nhất sử dụng +0.450 theo TKCS.', 'OPEN', 1, NOW());

-- 5. Seed Comments for RFIs
-- Comments for RFI 1
INSERT INTO `tbl_rfi_comments` (`rfi_id`, `content`, `user_id`, `created_at`) 
SELECT id, 'Đã kiểm tra sơ bộ, 700mm là chính xác do có sự thay đổi kích thước ống thoát nước.', 1, NOW() FROM `tbl_rfis` WHERE `title` LIKE '%hộp kỹ thuật%' LIMIT 1;

INSERT INTO `tbl_rfi_comments` (`rfi_id`, `content`, `user_id`, `created_at`) 
SELECT id, 'Cần xác nhận từ bên Tư vấn thiết kế trước khi thi công hàng loạt.', 1, NOW() FROM `tbl_rfis` WHERE `title` LIKE '%hộp kỹ thuật%' LIMIT 1;

-- Comments for RFI 2
INSERT INTO `tbl_rfi_comments` (`rfi_id`, `content`, `user_id`, `created_at`) 
SELECT id, 'Tôi đã gửi mail hỏi đơn vị thiết kế, chờ phản hồi trong chiều nay.', 1, DATE_ADD(NOW(), INTERVAL 1 HOUR) FROM `tbl_rfis` WHERE `title` LIKE '%thép tăng cường%' LIMIT 1;
