-- V26__Add_More_Sample_Drawings.sql
-- =========================================================
-- Adding more varied drawings for Project 1 and 2
-- =========================================================

INSERT INTO `tbl_design_sheets` (`project_id`, `zone_id`, `sheet_number`, `title`, `discipline`, `revision`, `status`, `file_url`, `issued_at`, `issued_by`, `created_at`) VALUES
-- MEP for Project 1
(1, 12, 'E-101', 'Mặt bằng chiếu sáng tầng 1 - Block A', 'MEP', '00', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-15', 1, NOW()),
(1, 12, 'P-101', 'Sơ đồ cấp thoát nước nhà vệ sinh tầng 1', 'MEP', '00', 'FOR_REVIEW', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-16', 1, NOW()),

-- Landscape for Project 1
(1, NULL, 'L-101', 'Thiết kế cảnh quan công viên nội khu', 'LANDSCAPE', '01', 'PRELIMINARY', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-18', 1, NOW()),

-- Architecture for Project 2 (Landmark)
(2, 3, 'LT-ARCH-15', 'Mặt bằng căn phòng điển hình tầng 15-20', 'ARCH', '00', 'IFC', 'https://www.africau.edu/images/default/sample.pdf', '2026-03-10', 1, NOW());
