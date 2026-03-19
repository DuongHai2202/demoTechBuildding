-- V27__Seed_Drawings_For_Project_3.sql
-- =========================================================
-- Adding sample drawings for Green Valley (Project 3)
-- =========================================================

INSERT INTO `tbl_design_sheets` (`project_id`, `zone_id`, `sheet_number`, `title`, `discipline`, `revision`, `status`, `file_url`, `issued_at`, `issued_by`, `created_at`) VALUES
-- Zone 6: Phân khu A - Biệt thự
(3, 6, 'GV-ARCH-A01', 'Mặt bằng mẫu biệt thự đơn lập Type 1', 'ARCH', '00', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-01', 1, NOW()),
(3, 6, 'GV-STRUC-A05', 'Chi tiết cốt thép dầm sàn điển hình - Type 1', 'STRUC', '01', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-05', 1, NOW()),

-- Zone 7: Phân khu B - Nhà phố
(3, 7, 'GV-ARCH-B10', 'Mặt đứng dãy nhà phố LK-01 đến LK-10', 'ARCH', '00', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-10', 1, NOW()),

-- Zone 8: Khu tiện ích công cộng
(3, 8, 'GV-LAND-01', 'Quy hoạch cảnh quan khu Clubhouse & Hồ bơi', 'LANDSCAPE', '00', 'PRELIMINARY', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-15', 1, NOW()),
(3, 8, 'GV-MEP-01', 'Sơ đồ chiếu sáng công cộng khu vực CV-01', 'MEP', '00', 'FOR_REVIEW', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-18', 1, NOW());
