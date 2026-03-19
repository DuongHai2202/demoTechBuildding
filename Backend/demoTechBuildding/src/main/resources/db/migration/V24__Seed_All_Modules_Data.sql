-- =========================================================
-- V24: Comprehensive seed data for ALL modules
-- =========================================================

-- =========================================================
-- 1. PROJECTS (5 thêm, ID 1 đã có từ V10)
-- =========================================================
INSERT INTO `tbl_projects` (`id`, `name`, `project_code`, `description`, `address`, `start_date`, `end_date`, `status`) VALUES
(2, 'Tòa nhà văn phòng Landmark Tower', 'PROJ002', 'Dự án xây dựng tòa nhà văn phòng hạng A 25 tầng tại Quận 1, TP.HCM', '123 Nguyễn Huệ, Quận 1, TP.HCM', '2026-01-15', '2027-06-30', 'IN_PROGRESS'),
(3, 'Khu đô thị Green Valley', 'PROJ003', 'Khu đô thị xanh gồm 200 căn biệt thự và nhà phố liền kề', '456 Đại lộ Thăng Long, Hà Nội', '2026-03-01', '2028-12-31', 'PLANNING'),
(4, 'Bệnh viện Quốc tế MedCity', 'PROJ004', 'Bệnh viện quốc tế quy mô 500 giường bệnh, 12 tầng', '789 Trần Hưng Đạo, Đà Nẵng', '2025-06-01', '2027-12-31', 'IN_PROGRESS'),
(5, 'Trung tâm thương mại SunPlaza', 'PROJ005', 'TTTM kết hợp giải trí và mua sắm cao cấp', '321 Lê Lợi, Quận 7, TP.HCM', '2026-04-01', '2028-03-31', 'PLANNING'),
(6, 'Nhà máy sản xuất TechFactory', 'PROJ006', 'Nhà máy sản xuất linh kiện điện tử tiêu chuẩn GMP', '100 KCN Bình Dương, Bình Dương', '2025-09-01', '2026-12-31', 'IN_PROGRESS');

-- =========================================================
-- 2. ZONES (5-6 zones cho các dự án)
-- =========================================================
INSERT INTO `tbl_zones` (`id`, `project_id`, `name`, `zone_code`, `parent_id`) VALUES
-- Zones cho PROJ002 (Landmark Tower)
(1, 2, 'Tầng hầm B1-B3', 'LT-B', NULL),
(2, 2, 'Khối đế (Tầng 1-5)', 'LT-PD', NULL),
(3, 2, 'Khối tháp (Tầng 6-25)', 'LT-TW', NULL),
(4, 2, 'Tầng kỹ thuật T15', 'LT-MEP', 3),
(5, 2, 'Sân thượng & Helipad', 'LT-RF', NULL),
-- Zones cho PROJ003 (Green Valley)
(6, 3, 'Phân khu A - Biệt thự', 'GV-A', NULL),
(7, 3, 'Phân khu B - Nhà phố', 'GV-B', NULL),
(8, 3, 'Khu tiện ích công cộng', 'GV-C', NULL),
-- Zones cho PROJ004 (MedCity)
(9, 4, 'Khoa Nội', 'MC-INT', NULL),
(10, 4, 'Khoa Ngoại', 'MC-SUR', NULL),
(11, 4, 'Khoa Cấp cứu', 'MC-ER', NULL),
-- Zones cho Dự án mẫu (ID=1)
(12, 1, 'Block A', 'DA-A', NULL),
(13, 1, 'Block B', 'DA-B', NULL);

-- =========================================================
-- 3. PARTNERS (7 đối tác)
-- =========================================================
INSERT INTO `tbl_partners` (`id`, `name`, `partner_code`, `tax_code`, `status`, `type`, `address`, `contact_person`, `phone`, `email`, `capacity_profile`) VALUES
(1, 'Công ty TNHH Xây dựng Hòa Phát', 'PT-HP', '0301234567', 'ACTIVE', 'MAIN_CONTRACTOR', '456 Nguyễn Văn Linh, Quận 7, TP.HCM', 'Nguyễn Văn Minh', '0901234567', 'minh.nv@hoaphat-cons.vn', 'Năng lực thi công nhà cao tầng trên 30 tầng, hạng I'),
(2, 'Công ty CP Cơ điện Việt Á', 'PT-VA', '0302345678', 'ACTIVE', 'SUBCONTRACTOR', '789 Lý Thường Kiệt, Quận 10, TP.HCM', 'Trần Thị Lan', '0912345678', 'lan.tt@vieta-mep.com', 'Chuyên M&E cho nhà cao tầng, hạng II'),
(3, 'CTCP Thép Pomina', 'PT-PM', '3600123456', 'ACTIVE', 'SUPPLIER', '100 KCN Phú Mỹ, Bà Rịa Vũng Tàu', 'Lê Quốc Hưng', '0923456789', 'hung.lq@pomina.com.vn', 'Nhà sản xuất thép hàng đầu Việt Nam'),
(4, 'Công ty TNHH Tư vấn thiết kế ABC', 'PT-ABC', '0303456789', 'ACTIVE', 'CONSULTANT', '12 Trần Não, Quận 2, TP.HCM', 'Phạm Đức Anh', '0934567890', 'anh.pd@abc-design.vn', 'Tư vấn thiết kế kiến trúc & kết cấu'),
(5, 'Tập đoàn Xây dựng Delta', 'PT-DL', '0304567890', 'ACTIVE', 'MAIN_CONTRACTOR', '55 Bạch Đằng, Quận Hải Châu, Đà Nẵng', 'Võ Thanh Hùng', '0945678901', 'hung.vt@delta-group.vn', 'Tổng thầu xây dựng dân dụng và công nghiệp'),
(6, 'Công ty CP PCCC Sài Gòn', 'PT-SG', '0305678901', 'ACTIVE', 'SUBCONTRACTOR', '200 Cách Mạng Tháng 8, Quận 3, TP.HCM', 'Đỗ Minh Tuấn', '0956789012', 'tuan.dm@sgfp.vn', 'Chuyên hệ thống PCCC, sprinkler'),
(7, 'Công ty TNHH Nội thất Elegant', 'PT-EL', '0306789012', 'INACTIVE', 'SUPPLIER', '300 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 'Hoàng Thị Mai', '0967890123', 'mai.ht@elegant.vn', 'Nội thất cao cấp cho khách sạn, văn phòng');

-- =========================================================
-- 4. CONTRACTS (6 hợp đồng)
-- =========================================================
INSERT INTO `tbl_contracts` (`id`, `project_id`, `contract_number`, `contract_name`, `partner_id`, `partner_name`, `contract_value`, `workflow_step`, `guarantee_info`, `status`, `type`, `signed_date`, `start_date`, `end_date`) VALUES
(1, 2, 'HD-LT-001', 'Hợp đồng tổng thầu xây dựng Landmark Tower', 1, 'Công ty TNHH Xây dựng Hòa Phát', 150000000000.00, 3, 'Bảo lãnh thực hiện hợp đồng: 10% giá trị hợp đồng. Thời hạn: 24 tháng.', 'ACTIVE', 'MAIN', '2026-01-10', '2026-01-15', '2027-06-30'),
(2, 2, 'HD-LT-002', 'Hợp đồng M&E Landmark Tower', 2, 'Công ty CP Cơ điện Việt Á', 35000000000.00, 2, 'Bảo lãnh thực hiện: 5%. Bảo hành: 24 tháng.', 'ACTIVE', 'MAIN', '2026-02-01', '2026-03-01', '2027-06-30'),
(3, 4, 'HD-MC-001', 'Hợp đồng tổng thầu Bệnh viện MedCity', 5, 'Tập đoàn Xây dựng Delta', 280000000000.00, 4, 'Bảo lãnh: 10%. Bảo hành: 36 tháng.', 'ACTIVE', 'MAIN', '2025-05-20', '2025-06-01', '2027-12-31'),
(4, 4, 'HD-MC-002', 'Hợp đồng PCCC Bệnh viện MedCity', 6, 'Công ty CP PCCC Sài Gòn', 12000000000.00, 1, 'Bảo hành: 12 tháng. Bảo trì định kỳ 6 tháng/lần.', 'ACTIVE', 'MAIN', '2025-07-15', '2025-08-01', '2027-06-30'),
(5, 6, 'HD-TF-001', 'Hợp đồng xây dựng Nhà máy TechFactory', 1, 'Công ty TNHH Xây dựng Hòa Phát', 95000000000.00, 5, 'Bảo lãnh thực hiện: 8%.', 'ACTIVE', 'MAIN', '2025-08-15', '2025-09-01', '2026-12-31'),
(6, 1, 'HD-DA-001', 'Hợp đồng mẫu Dự án TechBuilding', 4, 'Công ty TNHH Tư vấn thiết kế ABC', 5000000000.00, 7, 'Bảo lãnh: 5%.', 'COMPLETED', 'MAIN', '2025-01-01', '2025-01-15', '2025-12-31');

-- =========================================================
-- 5. BOQ ITEMS (5-6 hạng mục cho mỗi hợp đồng lớn)
-- =========================================================
INSERT INTO `tbl_boq_items` (`id`, `contract_id`, `item_code`, `description`, `unit`, `quantity`, `unit_price`, `total_price`, `vat_rate`, `vat_amount`, `total_with_vat`) VALUES
-- HD-LT-001 (Landmark Tower - Tổng thầu)
(1, 1, 'BOQ-LT-001', 'Công tác đào đất hố móng', 'm3', 5000.0, 250000.00, 1250000000.00, 10.00, 125000000.00, 1375000000.00),
(2, 1, 'BOQ-LT-002', 'Bê tông móng M300', 'm3', 2500.0, 2800000.00, 7000000000.00, 10.00, 700000000.00, 7700000000.00),
(3, 1, 'BOQ-LT-003', 'Cốt thép móng D12-D32', 'Tấn', 800.0, 18500000.00, 14800000000.00, 10.00, 1480000000.00, 16280000000.00),
(4, 1, 'BOQ-LT-004', 'Xây gạch tường bao', 'm2', 15000.0, 180000.00, 2700000000.00, 10.00, 270000000.00, 2970000000.00),
(5, 1, 'BOQ-LT-005', 'Trát tường trong + ngoài', 'm2', 30000.0, 95000.00, 2850000000.00, 10.00, 285000000.00, 3135000000.00),
(6, 1, 'BOQ-LT-006', 'Lắp đặt hệ kính curtain wall', 'm2', 8000.0, 4500000.00, 36000000000.00, 10.00, 3600000000.00, 39600000000.00),
-- HD-LT-002 (Landmark Tower - M&E)
(7, 2, 'BOQ-ME-001', 'Hệ thống điện chiếu sáng tầng 1-25', 'HT', 1.0, 5000000000.00, 5000000000.00, 10.00, 500000000.00, 5500000000.00),
(8, 2, 'BOQ-ME-002', 'Hệ thống điều hòa trung tâm VRV', 'HT', 1.0, 12000000000.00, 12000000000.00, 10.00, 1200000000.00, 13200000000.00),
(9, 2, 'BOQ-ME-003', 'Hệ thống cấp thoát nước', 'HT', 1.0, 4500000000.00, 4500000000.00, 10.00, 450000000.00, 4950000000.00),
(10, 2, 'BOQ-ME-004', 'Hệ thống PCCC', 'HT', 1.0, 8000000000.00, 8000000000.00, 10.00, 800000000.00, 8800000000.00),
(11, 2, 'BOQ-ME-005', 'Hệ thống thang máy (4 cabin)', 'HT', 1.0, 6000000000.00, 6000000000.00, 10.00, 600000000.00, 6600000000.00),
-- HD-MC-001 (MedCity - Tổng thầu)
(12, 3, 'BOQ-MC-001', 'Phần móng cọc khoan nhồi D1000', 'Cọc', 120.0, 150000000.00, 18000000000.00, 10.00, 1800000000.00, 19800000000.00),
(13, 3, 'BOQ-MC-002', 'Kết cấu bê tông cốt thép thân', 'm3', 12000.0, 3200000.00, 38400000000.00, 10.00, 3840000000.00, 42240000000.00),
(14, 3, 'BOQ-MC-003', 'Hoàn thiện nội thất bệnh viện', 'm2', 25000.0, 2500000.00, 62500000000.00, 10.00, 6250000000.00, 68750000000.00),
(15, 3, 'BOQ-MC-004', 'Hệ thống khí y tế', 'HT', 1.0, 8000000000.00, 8000000000.00, 10.00, 800000000.00, 8800000000.00),
(16, 3, 'BOQ-MC-005', 'Hệ thống xử lý nước thải y tế', 'HT', 1.0, 5000000000.00, 5000000000.00, 10.00, 500000000.00, 5500000000.00);

-- =========================================================
-- 6. BIDDING PACKAGES (6 gói thầu)
-- =========================================================
INSERT INTO `tbl_bidding_packages` (`id`, `project_id`, `package_code`, `package_name`, `description`, `budget`, `status`, `deadline`, `criteria`) VALUES
(1, 2, 'BID-LT-001', 'Gói thầu Cung cấp thép xây dựng', 'Cung cấp toàn bộ thép cuộn và thép thanh cho dự án Landmark Tower', 22000000000.00, 'OPEN', '2026-04-15 17:00:00', '[{"name":"Giá","weight":40},{"name":"Năng lực kỹ thuật","weight":30},{"name":"Tiến độ cung ứng","weight":20},{"name":"Bảo hành","weight":10}]'),
(2, 2, 'BID-LT-002', 'Gói thầu Hệ thống Thang máy', 'Cung cấp và lắp đặt 4 thang máy giường bệnh + 2 thang khách', 8000000000.00, 'OPEN', '2026-05-01 17:00:00', '[{"name":"Giá","weight":35},{"name":"Thương hiệu","weight":25},{"name":"Bảo hành","weight":25},{"name":"Tiến độ","weight":15}]'),
(3, 3, 'BID-GV-001', 'Gói thầu San lấp mặt bằng Green Valley', 'San lấp và gia cố nền cho toàn bộ khu đô thị 50 hecta', 45000000000.00, 'EVALUATING', '2026-03-30 17:00:00', '[{"name":"Giá","weight":40},{"name":"Kinh nghiệm","weight":30},{"name":"Thiết bị","weight":20},{"name":"An toàn","weight":10}]'),
(4, 4, 'BID-MC-001', 'Gói thầu Thiết bị y tế MedCity', 'Cung cấp thiết bị y tế chẩn đoán hình ảnh (CT, MRI, X-ray)', 65000000000.00, 'OPEN', '2026-06-30 17:00:00', '[{"name":"Giá","weight":30},{"name":"Chất lượng thiết bị","weight":35},{"name":"Hậu mãi","weight":20},{"name":"Đào tạo","weight":15}]'),
(5, 5, 'BID-SP-001', 'Gói thầu Nội thất SunPlaza', 'Thiết kế và thi công nội thất toàn bộ TTTM SunPlaza', 30000000000.00, 'DRAFT', '2026-07-31 17:00:00', '[{"name":"Giá","weight":35},{"name":"Thiết kế","weight":30},{"name":"Chất lượng vật liệu","weight":20},{"name":"Tiến độ","weight":15}]'),
(6, 6, 'BID-TF-001', 'Gói thầu Hệ thống điều hòa nhà máy', 'Lắp đặt hệ thống điều hòa công nghiệp cho nhà máy TechFactory', 15000000000.00, 'AWARDED', '2026-02-28 17:00:00', '[{"name":"Giá","weight":40},{"name":"Công suất","weight":25},{"name":"Tiết kiệm năng lượng","weight":20},{"name":"Bảo hành","weight":15}]');

-- =========================================================
-- 7. BID SUBMISSIONS (ít nhất 2 hồ sơ mỗi gói thầu OPEN)
-- =========================================================
INSERT INTO `tbl_bid_submissions` (`id`, `package_id`, `partner_id`, `bid_price`, `status`, `notes`) VALUES
-- BID-LT-001 (Thép)
(1, 1, 3, 20500000000.00, 'PENDING', 'Pomina cam kết cung cấp thép đạt TCVN, tiến độ 30 ngày/đợt.'),
(2, 1, 5, 21200000000.00, 'PENDING', 'Delta đề xuất giao thép kèm gia công sẵn.'),
-- BID-LT-002 (Thang máy)
(3, 2, 2, 7500000000.00, 'PENDING', 'Thương hiệu Mitsubishi, bảo hành 5 năm.'),
(4, 2, 5, 7800000000.00, 'PENDING', 'Thương hiệu KONE, bảo hành 3 năm.'),
-- BID-GV-001 (San lấp)
(5, 3, 1, 43000000000.00, 'PENDING', 'Hòa Phát sẵn sàng huy động 50 xe tải + 10 máy ủi.'),
(6, 3, 5, 44500000000.00, 'PENDING', 'Delta có kinh nghiệm san lấp 5 dự án tương tự.'),
(7, 3, 4, 42000000000.00, 'PENDING', 'ABC liên danh với nhà thầu phụ.'),
-- BID-MC-001 (Thiết bị y tế)
(8, 4, 2, 62000000000.00, 'PENDING', 'Thiết bị GE Healthcare, đào tạo 6 tháng.'),
-- BID-TF-001 (Điều hòa nhà máy - AWARDED)
(9, 6, 2, 14200000000.00, 'ACCEPTED', 'Việt Á trúng thầu. Hệ thống Daikin công nghiệp.'),
(10, 6, 6, 14800000000.00, 'REJECTED', 'Giá cao hơn, không đạt tiêu chí tiết kiệm năng lượng.');

-- =========================================================
-- 8. DRAWINGS (bản vẽ cho các dự án/hợp đồng)
-- =========================================================
INSERT INTO `tbl_drawings` (`id`, `project_id`, `contract_id`, `name`, `drawing_number`, `version`) VALUES
-- Landmark Tower
(1, 2, 1, 'Mặt bằng tổng thể Landmark Tower', 'DWG-LT-001', 'Rev.A'),
(2, 2, 1, 'Mặt cắt kết cấu tầng hầm B1-B3', 'DWG-LT-002', 'Rev.B'),
(3, 2, 1, 'Chi tiết cốt thép móng M1-M5', 'DWG-LT-003', 'Rev.A'),
(4, 2, 2, 'Sơ đồ hệ thống điện tầng 1-10', 'DWG-LT-ME-001', 'Rev.C'),
(5, 2, 2, 'Sơ đồ hệ thống HVAC tầng điển hình', 'DWG-LT-ME-002', 'Rev.A'),
-- MedCity
(6, 4, 3, 'Mặt bằng tổng thể Bệnh viện MedCity', 'DWG-MC-001', 'Rev.A'),
(7, 4, 3, 'Chi tiết kết cấu khung tầng 1-6', 'DWG-MC-002', 'Rev.B'),
(8, 4, 4, 'Sơ đồ hệ thống PCCC tầng điển hình', 'DWG-MC-PCCC-001', 'Rev.A'),
-- TechFactory
(9, 6, 5, 'Mặt bằng nhà xưởng sản xuất', 'DWG-TF-001', 'Rev.A'),
(10, 6, 5, 'Chi tiết kết cấu thép nhà xưởng', 'DWG-TF-002', 'Rev.C');

-- =========================================================
-- 9. TECHNICAL STANDARDS (tiêu chuẩn kỹ thuật)
-- =========================================================
INSERT INTO `tbl_technical_standards` (`id`, `code`, `name`, `description`, `category`, `version`, `project_id`) VALUES
(1, 'TCVN-5574', 'Kết cấu bê tông và bê tông cốt thép', 'Tiêu chuẩn thiết kế kết cấu BT&BTCT theo TCVN 5574:2018', 'Kết cấu', '2018', 2),
(2, 'TCVN-2737', 'Tải trọng và tác động - Tiêu chuẩn thiết kế', 'Tiêu chuẩn tải trọng gió, tải trọng sử dụng công trình', 'Kết cấu', '2023', 2),
(3, 'TCVN-9386', 'Thiết kế công trình chịu động đất', 'Tiêu chuẩn thiết kế kháng chấn cho nhà và công trình', 'Kết cấu', '2012', 4),
(4, 'TCVN-5738', 'Hệ thống báo cháy tự động - Yêu cầu kỹ thuật', 'Tiêu chuẩn thiết kế, lắp đặt hệ thống báo cháy tự động', 'PCCC', '2021', 4),
(5, 'QCVN-06', 'An toàn cháy cho nhà và công trình', 'Quy chuẩn quốc gia về an toàn cháy nổ', 'PCCC', '2022', 2),
(6, 'TCVN-6160', 'PCCC - Nhà cao tầng - Yêu cầu thiết kế', 'Yêu cầu thiết kế phòng cháy và chữa cháy cho nhà cao tầng (>10 tầng)', 'PCCC', '1996', 2),
(7, 'TCVN-4054', 'Đường ô tô - Yêu cầu thiết kế', 'Tiêu chuẩn thiết kế đường giao thông nội bộ', 'Hạ tầng', '2005', 3),
(8, 'TCVN-33', 'Cấp nước - Mạng lưới đường ống', 'Tiêu chuẩn thiết kế hệ thống cấp nước đô thị', 'CTN', '2006', 3);

-- =========================================================
-- 10. MATERIAL REQUESTS (yêu cầu xuất kho)
-- =========================================================
INSERT INTO `tbl_material_requests` (`id`, `project_id`, `requester_id`, `material_id`, `requested_quantity`, `status`, `notes`) VALUES
(1, 2, 1, 6, 500.0, 'APPROVED', 'Cần xi măng cho đổ bê tông móng Block A'),
(2, 2, 1, 9, 2000.0, 'APPROVED', 'Thép cuộn D8 cho đai cột tầng 1-5'),
(3, 2, 1, 16, 200.0, 'PENDING', 'Cáp điện cho hệ thống điện tầng 6-10'),
(4, 4, 1, 21, 50.0, 'PENDING', 'Ống uPVC D90 cho hệ thống thoát nước Khoa Nội'),
(5, 6, 1, 11, 5.0, 'CHECKED', 'Máy lạnh VRV cho khu văn phòng nhà máy'),
(6, 2, 1, 31, 100.0, 'APPROVED', 'Mũ bảo hộ cho toàn bộ CN tầng hầm'),
(7, 4, 1, 33, 80.0, 'PENDING', 'Áo phản quang cho công nhân Khoa Ngoại');

-- =========================================================
-- 11. MATERIAL NORMS (định mức vật tư cho BOQ Items)
-- =========================================================
INSERT INTO `tbl_material_norms` (`id`, `boq_item_id`, `material_id`, `quantity_per_unit`) VALUES
-- BOQ-LT-002 (BT móng M300): Xi măng + Cát + Đá
(1, 2, 6, 8.0),   -- 8 bao xi măng / m3 BT
(2, 2, 7, 0.5),   -- 0.5 m3 cát / m3 BT
(3, 2, 10, 0.8),  -- 0.8 m3 đá / m3 BT
-- BOQ-LT-003 (Cốt thép): Thép cuộn
(4, 3, 9, 1050.0), -- 1050 kg thép / tấn (kể hao hụt 5%)
-- BOQ-LT-004 (Xây gạch): Gạch + Xi măng + Cát
(5, 4, 8, 70.0),  -- 70 viên gạch / m2
(6, 4, 6, 0.2),   -- 0.2 bao xi măng / m2
(7, 4, 7, 0.03),  -- 0.03 m3 cát / m2
-- BOQ-ME-001 (Điện): Cáp + đèn LED + ống luồn
(8, 7, 16, 30.0),  -- 30m cáp / 1 HT
(9, 7, 17, 50.0),  -- 50 ống luồn
(10, 7, 18, 200.0); -- 200 bộ đèn LED
