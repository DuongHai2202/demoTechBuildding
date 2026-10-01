-- ============================================================================
-- V54: Comprehensive Seed Dataset with Relational Integrity (~20-30 rows each)
-- Modules: Users, Roles, Partners, Projects, Zones, Project Members, Contracts,
--          BOQ Items, Contract Workflow, Bidding, Submissions, Drawings,
--          Standards, Material Requests, Work Logs, Shifts & Attendance, Notifications.
-- ============================================================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. ROLES ENSURANCE
-- ============================================================================
INSERT IGNORE INTO `tbl_roles` (`name`, `description`, `created_by`) VALUES
('ADMIN', 'Quản trị viên toàn hệ thống', 'SYSTEM'),
('PM', 'Chỉ huy trưởng / Quản lý dự án', 'SYSTEM'),
('STAFF', 'Kỹ sư & Nhân viên hiện trường', 'SYSTEM'),
('PARTNER', 'Đại diện nhà thầu & Đối tác', 'SYSTEM'),
('GUEST', 'Khách tham quan / Chuyên gia kiểm toán', 'SYSTEM');

-- ============================================================================
-- 2. PARTNERS (~25 đối tác đa ngành: Tổng thầu, Thầu phụ M&E, Cung ứng, Tư vấn)
-- ============================================================================
INSERT INTO `tbl_partners` (`id`, `name`, `partner_code`, `tax_code`, `status`, `type`, `address`, `contact_person`, `phone`, `email`, `capacity_profile`) VALUES
(8, 'Công ty CP Xây dựng Coteccons', 'PT-CTD', '0303443233', 'ACTIVE', 'MAIN_CONTRACTOR', '236/6 Điện Biên Phủ, Phường 17, Bình Thạnh, TP.HCM', 'Bolat Duisenov', '0903112233', 'contact@coteccons.vn', 'Tổng thầu thi công xây dựng dân dụng & công nghiệp hàng đầu Việt Nam'),
(9, 'Tập đoàn Xây dựng Hòa Bình', 'PT-HBC', '0301804827', 'ACTIVE', 'MAIN_CONTRACTOR', '123 Nguyễn Đình Chiểu, Phường 6, Quận 3, TP.HCM', 'Lê Viết Hải', '0903223344', 'info@hbcg.vn', 'Nhà thầu xây dựng cấp đặc biệt, thi công cao ốc và hạ tầng'),
(10, 'Công ty CP Xây dựng Central', 'PT-CEN', '0314477382', 'ACTIVE', 'MAIN_CONTRACTOR', '204/9 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức, TP.HCM', 'Trần Quang Tuấn', '0903334455', 'contact@centralcons.vn', 'Tổng thầu Design & Build các dự án căn hộ và resort cao cấp'),
(11, 'Công ty CP Đầu tư Xây dựng Ricons', 'PT-RIC', '0303531128', 'ACTIVE', 'MAIN_CONTRACTOR', '53-55 Bà Huyện Thanh Quan, Phường 9, Quận 3, TP.HCM', 'Trần Văn Mười', '0903445566', 'contact@ricons.com.vn', 'Top 3 tổng thầu tư nhân lớn nhất Việt Nam'),
(12, 'Công ty CP Xây dựng Phục Hưng Holdings', 'PT-PHC', '0101180291', 'ACTIVE', 'MAIN_CONTRACTOR', 'Tòa nhà Mỹ Đình Plaza, 138 Trần Bình, Nam Từ Liêm, Hà Nội', 'Cao Tùng Lâm', '0903556677', 'phuchung@phuchung.com.vn', 'Nhà thầu thi công hạ tầng kỹ thuật và nhà ở cao cấp'),
(13, 'Tổng công ty CP Xuất nhập khẩu & Xây dựng VN (Vinaconex)', 'PT-VCX', '0100105398', 'ACTIVE', 'MAIN_CONTRACTOR', 'Tòa nhà Vinaconex, 34 Láng Hạ, Đống Đa, Hà Nội', 'Đào Ngọc Thanh', '0903667788', 'info@vinaconex.com.vn', 'Tổng thầu hạ tầng giao thông sân bay, cầu cảng, đô thị'),
(14, 'Công ty CP Cơ điện Lạnh REE (REE M&E)', 'PT-REE', '0301435151', 'ACTIVE', 'SUBCONTRACTOR', '364 Cộng Hòa, Phường 13, Tân Bình, TP.HCM', 'Nguyễn Ngọc Thái Bình', '0903778899', 'reeme@reecorp.com', 'Nhà thầu cơ điện số 1 Việt Nam cho cao ốc và bệnh viện'),
(15, 'Công ty CP Cơ điện Hawee (Hawee M&E)', 'PT-HAW', '0102693892', 'ACTIVE', 'SUBCONTRACTOR', 'Tòa nhà Hawee, Lê Trọng Tấn, Hà Đông, Hà Nội', 'Trịnh Văn Hà', '0903889900', 'contact@hawee.com.vn', 'Chuyên tổng thầu cơ điện MEP, trạm biến áp và phòng sạch'),
(16, 'Công ty CP Kỹ nghệ Lạnh Searefico', 'PT-SRF', '0301825708', 'ACTIVE', 'SUBCONTRACTOR', 'Lầu 14, Centec Tower, 72-74 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 'Lê Tấn Phước', '0903990011', 'info@searefico.com', 'Hệ thống kho lạnh công nghiệp và cơ điện thông minh'),
(17, 'Công ty TNHH Kỹ thuật Sigma', 'PT-SIG', '0101859384', 'ACTIVE', 'SUBCONTRACTOR', 'Tầng 12, Tòa nhà Zodiac, Duy Tân, Cầu Giấy, Hà Nội', 'Nguyễn Quang Ngọc', '0904001122', 'sigma@sigma.net.vn', 'Thi công cơ điện chuẩn Nhật Bản cho nhà máy công nghệ cao'),
(18, 'Tập đoàn Thép Hòa Phát', 'PT-HPG', '0900189284', 'ACTIVE', 'SUPPLIER', 'KCN Phố Nối A, Giai Phạm, Yên Mỹ, Hưng Yên', 'Trần Đình Long', '0904112233', 'thep@hoaphat.com.vn', 'Thương hiệu thép xây dựng thị phần số 1 Việt Nam'),
(19, 'Công ty CP Xi măng Vicem Hà Tiên', 'PT-HT1', '0300479760', 'ACTIVE', 'SUPPLIER', '360 Bến Vân Đồn, Phường 1, Quận 4, TP.HCM', 'Lưu Đình Cường', '0904223344', 'sales@vicemhatien.com.vn', 'Xi măng poóc lăng hỗn hợp PCB40 chất lượng cao'),
(20, 'Công ty CP Nhôm Kính Eurowindow', 'PT-EUW', '0101287114', 'ACTIVE', 'SUPPLIER', 'Tòa nhà Eurowindow, 2 Tôn Thất Tùng, Đống Đa, Hà Nội', 'Nguyễn Cảnh Hồng', '0904334455', 'info@eurowindow.biz', 'Cửa sổ nhôm kính, vách dựng kính Spider và Unitized'),
(21, 'Công ty TNHH Thang máy Mitsubishi VN', 'PT-MEL', '0312389102', 'ACTIVE', 'SUPPLIER', 'Tầng 10, Green Power, 35 Tôn Đức Thắng, Quận 1, TP.HCM', 'Shinichi Furuya', '0904445566', 'mitsubishi-lift@miev.vn', 'Cung cấp thang máy tốc độ cao và thang cuốn tự động'),
(22, 'Công ty Sơn Jotun Việt Nam', 'PT-JOT', '0301441838', 'ACTIVE', 'SUPPLIER', 'Số 1, Đường 10, KCN Sóng Thần 1, Dĩ An, Bình Dương', 'Jon Bigseth', '0904556677', 'jotun.vietnam@jotun.com', 'Sơn công nghiệp, sơn ngoại thất chống thấm kháng kiềm'),
(23, 'Công ty CP Dây cáp điện Việt Nam (CADIVI)', 'PT-CAD', '0300381564', 'ACTIVE', 'SUPPLIER', '70-72 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM', 'Lê Bá Thọ', '0904667788', 'cadivi@cadivi.vn', 'Nhà sản xuất cáp điện hạ thế, trung thế số 1 Việt Nam'),
(24, 'Công ty CP Nhựa Thiếu niên Tiền Phong', 'PT-NTP', '0200118502', 'ACTIVE', 'SUPPLIER', '2 An Đà, Ngô Quyền, Hải Phòng', 'Đặng Quốc Dũng', '0904778899', 'tienphong@nhuatienphong.vn', 'Ống nhựa uPVC, HDPE, PPR cho hệ thống cấp thoát nước'),
(25, 'Công ty TNHH Archetype Việt Nam', 'PT-ARC', '0302638891', 'ACTIVE', 'CONSULTANT', 'Tầng 20, REE Tower, 9 Đoàn Văn Bơ, Quận 4, TP.HCM', 'Pierre-Jean Malgouyres', '0904889900', 'archetype@archetype-group.com', 'Tư vấn kiến trúc, kết cấu và quản lý dự án quốc tế'),
(26, 'Tổng công ty Tư vấn Xây dựng VN (VNCC)', 'PT-VNC', '0100105327', 'ACTIVE', 'CONSULTANT', '243 Đê La Thành, Đống Đa, Hà Nội', 'Thân Hồng Linh', '0904990011', 'contact@vncc.vn', 'Tư vấn thiết kế các công trình biểu tượng quốc gia'),
(27, 'Công ty CP Kiểm định Xây dựng Sài Gòn (SCQC)', 'PT-SCQ', '0302918239', 'ACTIVE', 'CONSULTANT', '63 Lý Tự Trọng, Bến Nghé, Quận 1, TP.HCM', 'Nguyễn Văn Hiệp', '0905001122', 'info@scqc.com.vn', 'Kiểm định chất lượng, thí nghiệm vật liệu và nén tĩnh cọc'),
(28, 'Công ty TNHH Bơm Grundfos Việt Nam', 'PT-GRU', '0305182910', 'ACTIVE', 'SUPPLIER', 'Lầu 7, Tòa nhà Mapletree, 1060 Nguyễn Văn Linh, Quận 7, TP.HCM', 'Morten Riis', '0905112233', 'grundfos-vn@grundfos.com', 'Giải pháp máy bơm tăng áp, bơm cứu hỏa công nghiệp')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `status` = VALUES(`status`),
  `address` = VALUES(`address`),
  `contact_person` = VALUES(`contact_person`),
  `capacity_profile` = VALUES(`capacity_profile`);

-- ============================================================================
-- 3. USERS (Nhân sự & Đối tác mẫu - không ghi đè tài khoản người dùng cá nhân)
-- Mật khẩu chung: admin123
-- ============================================================================
INSERT INTO `tbl_users` (`username`, `password`, `full_name`, `phone`, `email`, `partner_id`, `status`, `is_deleted`) VALUES
('pm_an', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kỹ sư trưởng Nguyễn Văn An', '0911000002', 'an.nguyen@techbuild.vn', NULL, 'ACTIVE', FALSE),
('pm_tuan', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Chỉ huy phó Trần Minh Tuấn', '0911000003', 'tuan.tran@techbuild.vn', NULL, 'ACTIVE', FALSE),
('pm_linh', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Giám đốc dự án Lê Thùy Linh', '0911000004', 'linh.le@techbuild.vn', NULL, 'ACTIVE', FALSE),
('pm_hai', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Chỉ huy trưởng Hoàng Thanh Hải', '0911000005', 'hai.hoang@techbuild.vn', NULL, 'ACTIVE', FALSE),
('pm_long', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Trưởng ban QLDA Vũ Đình Long', '0911000006', 'long.vu@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_dat', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Cán bộ HSE Phạm Quốc Đạt', '0911000007', 'dat.pham@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_nam', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Thủ kho vật tư Vũ Hải Nam', '0911000008', 'nam.vu@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_ha', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kế toán dự án Đặng Thu Hà', '0911000009', 'ha.dang@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_minh', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kỹ sư kết cấu Bùi Quang Minh', '0911000010', 'minh.bui@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_trung', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kỹ sư MEP Nguyễn Thành Trung', '0911000011', 'trung.nguyen@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_phuc', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kỹ sư trắc địa Đỗ Hồng Phúc', '0911000012', 'phuc.do@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_khoa', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kỹ sư QA/QC Phan Đăng Khoa', '0911000013', 'khoa.phan@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_tuananh', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kỹ sư QS Hồ Tuấn Anh', '0911000014', 'tuananh.ho@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_duy', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Giám sát hoàn thiện Ngô Khánh Duy', '0911000015', 'duy.ngo@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_thao', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Cán bộ trắc đạc Chu Phương Thảo', '0911000016', 'thao.chu@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_lan', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Chuyên viên kiểm định Tạ Ngọc Lan', '0911000017', 'lan.ta@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_viet', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kỹ sư PCCC Trịnh Quốc Việt', '0911000018', 'viet.trinh@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_quang', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kỹ sư hạ tầng Đoàn Nhật Quang', '0911000019', 'quang.doan@techbuild.vn', NULL, 'ACTIVE', FALSE),
('staff_thanh', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Thủ kho vật tư phụ Lê Kim Thanh', '0911000020', 'thanh.le@techbuild.vn', NULL, 'ACTIVE', FALSE),
('partner_duc', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Đại diện nhà thầu Hoàng Minh Đức', '0911000021', 'duc.hoang@coteccons.vn', 8, 'ACTIVE', FALSE),
('partner_mai', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Quản lý cung ứng Mai Phương Thảo', '0911000022', 'thao.mai@hoaphat.com.vn', 18, 'ACTIVE', FALSE),
('partner_son', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Chỉ huy nhà thầu Nguyễn Thái Sơn', '0911000023', 'son.nguyen@reecorp.com', 14, 'ACTIVE', FALSE),
('partner_hung', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Đại diện tư vấn Lê Mạnh Hùng', '0911000024', 'hung.le@archetype-group.com', 25, 'ACTIVE', FALSE),
('guest_expert', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Chuyên gia độc lập Dr. David Evans', '0911000025', 'david.evans@globalaudit.org', NULL, 'ACTIVE', FALSE),
('guest_auditor', '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S', 'Kiểm toán viên Phạm Hồng Nhung', '0911000026', 'nhung.pham@pwc.com', NULL, 'ACTIVE', FALSE)
ON DUPLICATE KEY UPDATE
  `full_name` = VALUES(`full_name`),
  `status` = 'ACTIVE',
  `is_deleted` = FALSE;

-- ============================================================================
-- 4. USER ROLES (Tuân thủ chuẩn V41: 1 tài khoản có 1 vai trò duy nhất)
-- ============================================================================
DELETE FROM `tbl_user_has_roles` WHERE `user_id` IN (
  SELECT id FROM `tbl_users` WHERE username IN (
    'pm_an', 'pm_tuan', 'pm_linh', 'pm_hai', 'pm_long',
    'staff_dat', 'staff_nam', 'staff_ha', 'staff_minh', 'staff_trung',
    'staff_phuc', 'staff_khoa', 'staff_tuananh', 'staff_duy', 'staff_thao',
    'staff_lan', 'staff_viet', 'staff_quang', 'staff_thanh',
    'partner_duc', 'partner_mai', 'partner_son', 'partner_hung',
    'guest_expert', 'guest_auditor'
  )
);

INSERT INTO `tbl_user_has_roles` (`user_id`, `role_id`)
SELECT u.id, r.id FROM `tbl_users` u JOIN `tbl_roles` r ON r.name = 'PM' WHERE u.username IN ('pm_an', 'pm_tuan', 'pm_linh', 'pm_hai', 'pm_long');

INSERT INTO `tbl_user_has_roles` (`user_id`, `role_id`)
SELECT u.id, r.id FROM `tbl_users` u JOIN `tbl_roles` r ON r.name = 'STAFF' WHERE u.username LIKE 'staff_%';

INSERT INTO `tbl_user_has_roles` (`user_id`, `role_id`)
SELECT u.id, r.id FROM `tbl_users` u JOIN `tbl_roles` r ON r.name = 'PARTNER' WHERE u.username LIKE 'partner_%';

INSERT INTO `tbl_user_has_roles` (`user_id`, `role_id`)
SELECT u.id, r.id FROM `tbl_users` u JOIN `tbl_roles` r ON r.name = 'GUEST' WHERE u.username LIKE 'guest_%';

-- ============================================================================
-- 5. PROJECTS (~22 dự án thực tế trên toàn quốc với GPS và bán kính Geofence)
-- ============================================================================
INSERT INTO `tbl_projects` (`id`, `name`, `project_code`, `description`, `address`, `latitude`, `longitude`, `radius_meters`, `start_date`, `end_date`, `status`) VALUES
(7, 'Vinhomes Smart City - Phân khu Sapphire', 'DA-2026-0007', 'Khu đô thị thông minh phía Tây Hà Nội quy mô 280ha', 'Đại lộ Thăng Long, Nam Từ Liêm, Hà Nội', 21.002814, 105.748529, 300, '2026-01-05', '2027-12-31', 'IN_PROGRESS'),
(8, 'Cảng Hàng không Quốc tế Long Thành - Gói 5.10', 'DA-2026-0008', 'Gói thầu thi công xây dựng và lắp đặt thiết bị nhà ga hành khách', 'Xã Bình Sơn, Huyện Long Thành, Đồng Nai', 10.781250, 107.013540, 500, '2025-09-01', '2028-06-30', 'IN_PROGRESS'),
(9, 'Tuyến Metro số 1 Bến Thành - Suối Tiên', 'DA-2026-0009', 'Tuyến đường sắt đô thị hiện đại kết nối trung tâm TP.HCM và cửa ngõ phía Đông', 'Ga Bến Thành, Quận 1, TP.HCM', 10.772540, 106.698010, 250, '2025-01-10', '2026-12-31', 'IN_PROGRESS'),
(10, 'Bệnh viện Đa khoa Bạch Mai cơ sở 2', 'DA-2026-0010', 'Bệnh viện công lập cấp đặc biệt quy mô 1.000 giường bệnh', 'Xã Liêm Tuyền, TP. Phủ Lý, Hà Nam', 20.537210, 105.918520, 200, '2026-02-15', '2027-10-30', 'PLANNING'),
(11, 'Khu công nghiệp VSIP 3 - Nhà máy LEGO', 'DA-2026-0011', 'Tổ hợp nhà máy sản xuất trung hòa carbon quy mô 44ha', 'KCN VSIP III, Tân Uyên, Bình Dương', 11.084530, 106.758210, 350, '2025-11-01', '2027-04-30', 'IN_PROGRESS'),
(12, 'Cầu Mỹ Thuận 2 và đường dẫn hai đầu cầu', 'DA-2026-0012', 'Cầu dây văng khẩu độ lớn vượt sông Tiền nối Tiền Giang và Vĩnh Long', 'Quốc lộ 1A, Huyện Cái Bè, Tiền Giang', 10.278910, 105.908230, 400, '2025-03-01', '2026-11-30', 'COMPLETED'),
(13, 'Tòa tháp Tài chính Bitexco Tower 2', 'DA-2026-0013', 'Tòa tháp đôi chọc trời 68 tầng biểu tượng thương mại mới', 'Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM', 10.771820, 106.704410, 150, '2026-04-01', '2029-12-31', 'PLANNING'),
(14, 'Trung tâm Hội chợ Triển lãm Quốc gia Đông Anh', 'DA-2026-0014', 'Quần thể triển lãm đa năng lớn nhất Đông Nam Á quy mô 90ha', 'Xã Cổ Loa, Huyện Đông Anh, Hà Nội', 21.112340, 105.852410, 450, '2026-03-15', '2028-09-30', 'PLANNING'),
(15, 'Tổ hợp Khách sạn & Nghỉ dưỡng Regent Phú Quốc', 'DA-2026-0015', 'Khu nghỉ dưỡng 6 sao biệt thự biển cao cấp tại Bãi Trường', 'Bãi Trường, Dương Tơ, TP. Phú Quốc, Kiên Giang', 10.125630, 103.985620, 300, '2025-08-01', '2027-03-31', 'IN_PROGRESS'),
(16, 'Khu phức hợp Sun Marina Town Hạ Long', 'DA-2026-0016', 'Tòa tháp đôi bên bờ vịnh di sản cùng bến du thuyền quốc tế', 'Đường bao biển Bãi Cháy, TP. Hạ Long, Quảng Ninh', 20.951230, 107.054320, 200, '2026-02-01', '2028-05-30', 'IN_PROGRESS'),
(17, 'Nhà máy Nhiệt điện Quảng Trạch 1', 'DA-2026-0017', 'Công trình năng lượng trọng điểm công suất 2x600MW', 'Thôn Vĩnh Sơn, Xã Quảng Đông, Huyện Quảng Trạch, Quảng Bình', 17.884510, 106.452140, 500, '2025-06-15', '2027-12-31', 'IN_PROGRESS'),
(18, 'Khu đô thị Ecopark Hưng Yên - Phân khu Vịnh Đảo', 'DA-2026-0018', 'Quần thể biệt thự đảo triệu USD bao quanh bởi mặt nước sinh thái', 'Xã Xuân Quan, Huyện Văn Giang, Hưng Yên', 20.965410, 105.932120, 350, '2025-10-01', '2027-08-31', 'IN_PROGRESS'),
(19, 'Tòa nhà Trụ sở Tập đoàn Viettel Cầu Giấy', 'DA-2026-0019', 'Trụ sở công nghệ thông minh đạt chứng chỉ công trình xanh LEED Gold', 'Ngõ 19 Duy Tân, Cầu Giấy, Hà Nội', 21.026840, 105.789210, 150, '2025-04-10', '2026-10-31', 'COMPLETED'),
(20, 'Trung tâm Đổi mới Sáng tạo Quốc gia NIC Hòa Lạc', 'DA-2026-0020', 'Trung tâm R&D và vườn ươm khởi nghiệp công nghệ cao', 'Khu CNC Hòa Lạc, Thạch Thất, Hà Nội', 21.008920, 105.534210, 300, '2025-07-01', '2027-06-30', 'IN_PROGRESS'),
(21, 'Khu căn hộ cao cấp Masteri Centre Point', 'DA-2026-0021', 'Khu compound căn hộ cao cấp 10 tòa tháp tại Vinhomes Grand Park', 'Đường Nguyễn Xiển, Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM', 10.845610, 106.839820, 250, '2026-01-20', '2028-02-28', 'IN_PROGRESS'),
(22, 'Cảng biển Quốc tế Lạch Huyện - Bến số 3 & 4', 'DA-2026-0022', 'Cảng nước sâu đón tàu trọng tải đến 100.000 DWT', 'Đảo Cát Hải, Huyện Cát Hải, Hải Phòng', 20.845630, 106.912340, 500, '2025-05-01', '2027-07-31', 'IN_PROGRESS')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `address` = VALUES(`address`),
  `status` = VALUES(`status`),
  `latitude` = VALUES(`latitude`),
  `longitude` = VALUES(`longitude`),
  `radius_meters` = VALUES(`radius_meters`);

-- ============================================================================
-- 6. ZONES (~25 phân khu kỹ thuật liên kết dự án)
-- ============================================================================
INSERT INTO `tbl_zones` (`id`, `project_id`, `name`, `zone_code`, `parent_id`) VALUES
(14, 7, 'Khu tháp S1 - Sapphire 1', 'VH-S1', NULL),
(15, 7, 'Khu tháp S2 - Sapphire 2', 'VH-S2', NULL),
(16, 7, 'Hầm đỗ xe ngầm liên thông', 'VH-BAS', NULL),
(17, 8, 'Khu vực Sảnh đi quốc tế', 'LT-DEP-INT', NULL),
(18, 8, 'Khu vực Sảnh đến quốc nội', 'LT-ARR-DOM', NULL),
(19, 8, 'Khu xử lý hành lý BHS', 'LT-BHS', 17),
(20, 8, 'Hệ thống đài kiểm soát không lưu', 'LT-ATC', NULL),
(21, 9, 'Ga ngầm Bến Thành', 'MT-ST01', NULL),
(22, 9, 'Ga ngầm Nhà hát Thành phố', 'MT-ST02', NULL),
(23, 9, 'Khu Depot Long Bình', 'MT-DEPOT', NULL),
(24, 10, 'Khối nhà khám & Cấp cứu 9 tầng', 'BM-CLINIC', NULL),
(25, 10, 'Khối điều trị nội trú 12 tầng', 'BM-INPATIENT', NULL),
(26, 11, 'Khuôn viên xưởng ép nhựa A1', 'LG-MOULD-A1', NULL),
(27, 11, 'Kho tự động High-Bay Warehouse', 'LG-WH-AUTO', NULL),
(28, 11, 'Khu xử lý nước tái chế', 'LG-WATER', NULL),
(29, 13, 'Khối hầm B1-B5', 'BT-BAS', NULL),
(30, 13, 'Khối bán lẻ Podium T1-T6', 'BT-PODIUM', NULL),
(31, 13, 'Khối văn phòng tháp cao T7-T68', 'BT-OFFICE', NULL),
(32, 14, 'Nhà triển lãm chính Hall A', 'EX-HALL-A', NULL),
(33, 14, 'Trung tâm hội nghị quốc tế', 'EX-CONF', NULL),
(34, 15, 'Khu biệt thự biển Water Villas', 'RG-WATER', NULL),
(35, 15, 'Khu Sky Suites & Spa', 'RG-SKY', NULL),
(36, 18, 'Đảo lớn Grand Island', 'EP-ISL-01', NULL),
(37, 21, 'Tháp A1 Gardenia', 'MAS-A1', NULL),
(38, 21, 'Tháp B2 Lotus', 'MAS-B2', NULL),
(39, 22, 'Cầu cảng bến số 3', 'LH-BERTH-3', NULL),
(40, 22, 'Bãi container tự động hóa', 'LH-CY-AUTO', NULL)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ============================================================================
-- 7. PROJECT MEMBERS (~25 liên kết phân công nhân sự vào các dự án)
-- ============================================================================
INSERT IGNORE INTO `tbl_project_members` (`project_id`, `user_id`, `assigned_role`)
SELECT 7, id, 'PM' FROM `tbl_users` WHERE username = 'pm_an' UNION ALL
SELECT 7, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_dat' UNION ALL
SELECT 7, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_minh' UNION ALL
SELECT 7, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_khoa' UNION ALL
SELECT 8, id, 'PM' FROM `tbl_users` WHERE username = 'pm_linh' UNION ALL
SELECT 8, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_dat' UNION ALL
SELECT 8, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_trung' UNION ALL
SELECT 8, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_phuc' UNION ALL
SELECT 8, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_tuananh' UNION ALL
SELECT 9, id, 'PM' FROM `tbl_users` WHERE username = 'pm_tuan' UNION ALL
SELECT 9, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_phuc' UNION ALL
SELECT 9, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_viet' UNION ALL
SELECT 10, id, 'PM' FROM `tbl_users` WHERE username = 'pm_hai' UNION ALL
SELECT 10, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_trung' UNION ALL
SELECT 10, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_duy' UNION ALL
SELECT 11, id, 'PM' FROM `tbl_users` WHERE username = 'pm_long' UNION ALL
SELECT 11, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_dat' UNION ALL
SELECT 11, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_minh' UNION ALL
SELECT 11, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_lan' UNION ALL
SELECT 13, id, 'PM' FROM `tbl_users` WHERE username = 'pm_an' UNION ALL
SELECT 13, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_minh' UNION ALL
SELECT 14, id, 'PM' FROM `tbl_users` WHERE username = 'pm_tuan' UNION ALL
SELECT 14, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_khoa' UNION ALL
SELECT 15, id, 'PM' FROM `tbl_users` WHERE username = 'pm_linh' UNION ALL
SELECT 15, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_duy' UNION ALL
SELECT 18, id, 'PM' FROM `tbl_users` WHERE username = 'pm_hai' UNION ALL
SELECT 21, id, 'PM' FROM `tbl_users` WHERE username = 'pm_long' UNION ALL
SELECT 21, id, 'ENGINEER' FROM `tbl_users` WHERE username = 'staff_tuananh' UNION ALL
SELECT 22, id, 'PM' FROM `tbl_users` WHERE username = 'pm_an' UNION ALL
SELECT 22, id, 'SUPERVISOR' FROM `tbl_users` WHERE username = 'staff_phuc';

-- ============================================================================
-- 8. CONTRACTS (~25 hợp đồng thi công, cơ điện, kết cấu, cung ứng vật tư)
-- ============================================================================
INSERT INTO `tbl_contracts` (`id`, `project_id`, `contract_number`, `contract_name`, `partner_id`, `partner_name`, `contract_value`, `workflow_step`, `guarantee_info`, `status`, `type`, `signed_date`, `start_date`, `end_date`) VALUES
(7, 7, 'HD-2026/VH-CT01', 'Hợp đồng tổng thầu thi công tháp S1 và hầm', 8, 'Công ty CP Xây dựng Coteccons', 320000000000.00, 4, 'Bảo lãnh thực hiện: 10% do VietinBank phát hành', 'ACTIVE', 'MAIN', '2026-01-02', '2026-01-05', '2027-12-31'),
(8, 7, 'HD-2026/VH-MEP02', 'Hợp đồng thi công trọn gói cơ điện phân khu Sapphire', 14, 'Công ty CP Cơ điện Lạnh REE (REE M&E)', 85000000000.00, 3, 'Bảo lãnh: 5%. Bảo hành 24 tháng', 'ACTIVE', 'MAIN', '2026-01-10', '2026-02-01', '2027-11-30'),
(9, 7, 'HD-2026/VH-THEP03', 'Hợp đồng cung ứng thép xây dựng CB400/CB500', 18, 'Tập đoàn Thép Hòa Phát', 55000000000.00, 5, 'Thanh toán theo từng đợt giao nhận thực tế', 'ACTIVE', 'MAIN', '2026-01-05', '2026-01-15', '2027-06-30'),
(10, 8, 'HD-2025/LT-GA01', 'Hợp đồng thi công kết cấu thân nhà ga hành khách', 13, 'Tổng công ty CP Xuất nhập khẩu & Xây dựng VN (Vinaconex)', 850000000000.00, 4, 'Bảo lãnh thực hiện: 10%. Bảo hành 36 tháng', 'ACTIVE', 'MAIN', '2025-08-20', '2025-09-01', '2028-06-30'),
(11, 8, 'HD-2025/LT-BHS02', 'Hợp đồng cung cấp và lắp đặt hệ thống hành lý tự động BHS', 15, 'Công ty CP Cơ điện Hawee (Hawee M&E)', 180000000000.00, 2, 'Bảo lãnh: 8% do BIDV bảo lãnh', 'ACTIVE', 'MAIN', '2025-09-15', '2025-10-01', '2027-12-31'),
(12, 8, 'HD-2025/LT-THANG03', 'Hợp đồng cung cấp 48 thang cuốn và 32 thang máy', 21, 'Công ty TNHH Thang máy Mitsubishi VN', 92000000000.00, 3, 'Bảo trì trọn gói miễn phí 3 năm đầu', 'ACTIVE', 'MAIN', '2025-10-05', '2025-11-01', '2027-09-30'),
(13, 9, 'HD-2025/MT-HAM01', 'Hợp đồng thi công hầm ngầm khoan TBM tuyến Metro 1', 9, 'Tập đoàn Xây dựng Hòa Bình', 420000000000.00, 5, 'Bảo lãnh thực hiện: 10%', 'ACTIVE', 'MAIN', '2025-01-05', '2025-01-10', '2026-12-31'),
(14, 9, 'HD-2025/MT-PCCC02', 'Hợp đồng hệ thống PCCC và thông gió hút khói hầm', 14, 'Công ty CP Cơ điện Lạnh REE (REE M&E)', 68000000000.00, 4, 'Nghiệm thu theo tiêu chuẩn NFPA 130', 'ACTIVE', 'MAIN', '2025-02-15', '2025-03-01', '2026-11-30'),
(15, 10, 'HD-2026/BM-KHAM01', 'Hợp đồng xây lắp khối khám bệnh và phòng mổ vô trùng', 10, 'Công ty CP Xây dựng Central', 260000000000.00, 2, 'Bảo lãnh 10%. Bảo hành 24 tháng', 'ACTIVE', 'MAIN', '2026-02-10', '2026-02-15', '2027-10-30'),
(16, 11, 'HD-2025/LG-AUTO01', 'Hợp đồng xây dựng kho tự động High-Bay Warehouse', 11, 'Công ty CP Đầu tư Xây dựng Ricons', 195000000000.00, 4, 'Chứng chỉ công trình xanh LEED Platinum', 'ACTIVE', 'MAIN', '2025-10-20', '2025-11-01', '2027-04-30'),
(17, 11, 'HD-2025/LG-MEP02', 'Hợp đồng cơ điện phòng sạch tiêu chuẩn quốc tế', 17, 'Công ty TNHH Kỹ thuật Sigma', 74000000000.00, 3, 'Bảo lãnh thực hiện: 8%', 'ACTIVE', 'MAIN', '2025-11-05', '2025-11-15', '2027-03-31'),
(18, 13, 'HD-2026/BT-HAM01', 'Hợp đồng thi công tường vây và cọc barrette 5 tầng hầm', 8, 'Công ty CP Xây dựng Coteccons', 380000000000.00, 1, 'Bảo lãnh: 10%. Biện pháp Semi-Topdown', 'ACTIVE', 'MAIN', '2026-03-25', '2026-04-01', '2029-12-31'),
(19, 14, 'HD-2026/EX-HALL01', 'Hợp đồng kết cấu giàn không gian nhịp lớn 120m Hall A', 12, 'Công ty CP Xây dựng Phục Hưng Holdings', 310000000000.00, 2, 'Bảo lãnh 10% do Agribank phát hành', 'ACTIVE', 'MAIN', '2026-03-10', '2026-03-15', '2028-09-30'),
(20, 15, 'HD-2025/RG-RES01', 'Hợp đồng thi công hoàn thiện nội thất 80 căn biệt thự biển', 10, 'Công ty CP Xây dựng Central', 165000000000.00, 4, 'Vật liệu gỗ Teak tự nhiên kháng muối biển', 'ACTIVE', 'MAIN', '2025-07-25', '2025-08-01', '2027-03-31'),
(21, 16, 'HD-2026/SM-KINH01', 'Hợp đồng cung cấp và lắp dựng hệ vách kính cong mặt dựng', 20, 'Công ty CP Nhôm Kính Eurowindow', 120000000000.00, 3, 'Kính Low-E cản nhiệt 3 lớp chịu bão cấp 14', 'ACTIVE', 'MAIN', '2026-01-20', '2026-02-01', '2028-05-30'),
(22, 17, 'HD-2025/QT-MONG01', 'Hợp đồng bê tông khối lớn móng lò hơi và turbine', 13, 'Tổng công ty CP Xuất nhập khẩu & Xây dựng VN (Vinaconex)', 290000000000.00, 4, 'Bê tông ít tỏa nhiệt mác 400 có phụ gia tro bay', 'ACTIVE', 'MAIN', '2025-06-01', '2025-06-15', '2027-12-31'),
(23, 18, 'HD-2025/EP-DAO01', 'Hợp đồng thi công kè bờ hồ và kết cấu biệt thự đảo', 9, 'Tập đoàn Xây dựng Hòa Bình', 145000000000.00, 4, 'Chống xói lở bằng thảm địa kỹ thuật', 'ACTIVE', 'MAIN', '2025-09-20', '2025-10-01', '2027-08-31'),
(24, 21, 'HD-2026/MC-THAN01', 'Hợp đồng thi công kết cấu bê tông thân tháp Gardenia', 11, 'Công ty CP Đầu tư Xây dựng Ricons', 210000000000.00, 3, 'Chu kỳ đổ sàn 5 ngày/tầng bằng cốp pha nhôm', 'ACTIVE', 'MAIN', '2026-01-15', '2026-01-20', '2028-02-28'),
(25, 22, 'HD-2025/LH-CAU01', 'Hợp đồng đóng cọc ống thép SPP D1200 cầu cảng bến số 3', 13, 'Tổng công ty CP Xuất nhập khẩu & Xây dựng VN (Vinaconex)', 340000000000.00, 4, 'Cọc thép mạ kẽm chịu ăn mòn nước mặn', 'ACTIVE', 'MAIN', '2025-04-20', '2025-05-01', '2027-07-31')
ON DUPLICATE KEY UPDATE
  `contract_name` = VALUES(`contract_name`),
  `contract_value` = VALUES(`contract_value`),
  `status` = VALUES(`status`),
  `guarantee_info` = VALUES(`guarantee_info`),
  `workflow_step` = VALUES(`workflow_step`);

-- ============================================================================
-- 9. BOQ ITEMS (~25 hạng mục dự toán chi tiết với đơn giá và VAT)
-- ============================================================================
INSERT INTO `tbl_boq_items` (`id`, `contract_id`, `item_code`, `description`, `unit`, `quantity`, `unit_price`, `total_price`, `vat_rate`, `vat_amount`, `total_with_vat`) VALUES
(17, 7, 'BOQ-VH-001', 'Bê tông dầm sàn C30/37 bơm cần', 'm3', 8500.0, 1950000.00, 16575000000.00, 10.00, 1657500000.00, 18232500000.00),
(18, 7, 'BOQ-VH-002', 'Cốt thép thanh vằn D10-D32 mác CB400V', 'Tấn', 1450.0, 17800000.00, 25810000000.00, 10.00, 2581000000.00, 28391000000.00),
(19, 7, 'BOQ-VH-003', 'Ván khuôn nhôm hợp kim định hình cao tầng', 'm2', 32000.0, 310000.00, 9920000000.00, 10.00, 992000000.00, 10912000000.00),
(20, 8, 'BOQ-VH-MEP01', 'Cáp điện ngầm Cu/XLPE/PVC 3x240+1x120mm2', 'm', 3500.0, 1850000.00, 6475000000.00, 10.00, 647500000.00, 7122500000.00),
(21, 8, 'BOQ-VH-MEP02', 'Tổ hợp máy biến áp khô Cast Resin 2500kVA', 'Bộ', 4.0, 1250000000.00, 5000000000.00, 10.00, 500000000.00, 5500000000.00),
(22, 10, 'BOQ-LT-001', 'Cọc khoan nhồi đường kính D1500 sâu 62m', 'Cọc', 320.0, 240000000.00, 76800000000.00, 10.00, 7680000000.00, 84480000000.00),
(23, 10, 'BOQ-LT-002', 'Bê tông khối lớn đài móng nhà ga C40', 'm3', 28000.0, 2200000.00, 61600000000.00, 10.00, 6160000000.00, 67760000000.00),
(24, 10, 'BOQ-LT-003', 'Kết cấu khung vòm thép không gian mái sảnh', 'Tấn', 2100.0, 52000000.00, 109200000000.00, 10.00, 10920000000.00, 120120000000.00),
(25, 11, 'BOQ-LT-BHS01', 'Băng tải phân loại hành lý tốc độ cao ICS', 'Hệ thống', 1.0, 85000000000.00, 85000000000.00, 10.00, 8500000000.00, 93500000000.00),
(26, 12, 'BOQ-LT-TH01', 'Thang cuốn công cộng ngoài trời chống nước mưa', 'Bộ', 24.0, 1450000000.00, 34800000000.00, 10.00, 3480000000.00, 38280000000.00),
(27, 13, 'BOQ-MT-001', 'Vỏ hầm đúc sẵn bê tông sợi thép Segment TBM', 'Vòng', 1800.0, 65000000.00, 117000000000.00, 10.00, 11700000000.00, 128700000000.00),
(28, 14, 'BOQ-MT-PC01', 'Hệ thống chữa cháy vách tường hầm áp lực cao', 'Tuyến', 1.0, 28000000000.00, 28000000000.00, 10.00, 2800000000.00, 30800000000.00),
(29, 15, 'BOQ-BM-001', 'Vách ngăn panel kháng khuẩn phòng mổ chuyên dụng', 'm2', 4500.0, 3800000.00, 17100000000.00, 10.00, 1710000000.00, 18810000000.00),
(30, 16, 'BOQ-LG-001', 'Sàn bê tông siêu phẳng SuperFlat dung sai Fmin 100', 'm2', 44000.0, 650000.00, 28600000000.00, 10.00, 2860000000.00, 31460000000.00),
(31, 17, 'BOQ-LG-MEP01', 'Hệ thống xử lý không khí AHU phòng sạch Class 1000', 'Bộ', 12.0, 2100000000.00, 25200000000.00, 10.00, 2520000000.00, 27720000000.00),
(32, 18, 'BOQ-BT-001', 'Tường vây D1000 ngàm đá sâu 52m', 'm2', 12500.0, 4800000.00, 60000000000.00, 10.00, 6000000000.00, 6600000000.00),
(33, 19, 'BOQ-EX-001', 'Kết cấu thép ống không gian nhịp vượt 120m', 'Tấn', 3800.0, 48000000.00, 182400000000.00, 10.00, 18240000000.00, 200640000000.00),
(34, 20, 'BOQ-RG-001', 'Hồ bơi vô cực tràn viền đá tự nhiên Sukabumi', 'Cái', 40.0, 950000000.00, 38000000000.00, 10.00, 3800000000.00, 41800000000.00),
(35, 21, 'BOQ-SM-001', 'Vách kính Unitized 3 lớp bơm khí trơ cách âm', 'm2', 18000.0, 5200000.00, 93600000000.00, 10.00, 9360000000.00, 10296000000.00),
(36, 22, 'BOQ-QT-001', 'Bê tông đài móng tổ máy 600MW phụ gia tro bay', 'm3', 19500.0, 2450000.00, 47775000000.00, 10.00, 4777500000.00, 52552500000.00),
(37, 23, 'BOQ-EP-001', 'Kè sinh thái đá hộc kết hợp thảm thực vật thủy sinh', 'm', 2400.0, 8500000.00, 20400000000.00, 10.00, 2040000000.00, 22440000000.00),
(38, 24, 'BOQ-MC-001', 'Cốp pha nhôm hợp kim tấm lớn sàn tầng điển hình', 'm2', 26000.0, 320000.00, 8320000000.00, 10.00, 832000000.00, 9152000000.00),
(39, 25, 'BOQ-LH-001', 'Đóng cọc ống thép SPP D1200x20mm dài 65m ngoài biển', 'Tim', 210.0, 480000000.00, 100800000000.00, 10.00, 10080000000.00, 110880000000.00)
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `total_price` = VALUES(`total_price`);

-- ============================================================================
-- 10. CONTRACT WORKFLOW HISTORY (~20 bản ghi vết duyệt hợp đồng)
-- ============================================================================
INSERT INTO `tbl_contract_workflow_history` (`contract_id`, `from_step`, `to_step`, `action`, `note`, `changed_by`) VALUES
(7, 1, 2, 'SUBMIT', 'Chuyển hồ sơ dự thảo hợp đồng tổng thầu cho Ban Giám đốc phê duyệt', 'pm_an'),
(7, 2, 3, 'APPROVE', 'Ban Giám đốc đã thông qua các điều khoản thanh toán', 'pm_linh'),
(7, 3, 4, 'SIGN', 'Ký hợp đồng chính thức và tiếp nhận bảo lãnh thực hiện từ VietinBank', 'System Administrator'),
(8, 1, 2, 'SUBMIT', 'Trình duyệt gói thầu cơ điện Sapphire', 'pm_an'),
(8, 2, 3, 'APPROVE', 'Phòng kỹ thuật nghiệm thu hồ sơ năng lực nhà thầu REE', 'pm_tuan'),
(10, 1, 2, 'SUBMIT', 'Hồ sơ gói thầu 5.10 sân bay Long Thành', 'pm_linh'),
(10, 2, 3, 'REVIEW', 'Bộ Giao thông Vận tải thẩm định đơn giá', 'pm_hai'),
(10, 3, 4, 'SIGN', 'Ký kết hợp đồng xây dựng nhà ga với liên danh Vinaconex', 'System Administrator'),
(11, 1, 2, 'SUBMIT', 'Trình duyệt hệ thống phân loại hành lý BHS', 'pm_linh'),
(13, 2, 3, 'APPROVE', 'UBND TP.HCM phê duyệt phụ lục giải phóng mặt bằng TBM', 'pm_tuan'),
(13, 3, 4, 'SIGN', 'Ký phụ lục điều chỉnh tiến độ thi công ngầm', 'System Administrator'),
(13, 4, 5, 'EXECUTE', 'Đang vận hành máy khoan TBM giai đoạn 2', 'pm_tuan'),
(15, 1, 2, 'SUBMIT', 'Chuyển hồ sơ gói thầu phòng mổ vô trùng Bạch Mai 2', 'pm_hai'),
(16, 2, 3, 'APPROVE', 'Tập đoàn LEGO kiểm toán an toàn thi công', 'pm_long'),
(16, 3, 4, 'SIGN', 'Ký kết gói thầu nhà kho tự động', 'System Administrator'),
(18, 1, 1, 'INITIAL', 'Dự thảo hợp đồng móng hầm Bitexco Tower 2', 'pm_an'),
(19, 1, 2, 'SUBMIT', 'Trình phương án kết cấu giàn nhịp lớn Hall A', 'pm_tuan'),
(20, 3, 4, 'SIGN', 'Ký hợp đồng hoàn thiện nội thất resort Regent', 'pm_linh'),
(21, 2, 3, 'APPROVE', 'Chấp thuận mẫu kính Low-E 3 lớp từ Eurowindow', 'pm_tuan'),
(24, 2, 3, 'APPROVE', 'Nghiệm thu biện pháp thi công cốp pha nhôm 5 ngày/sàn', 'pm_long');

-- ============================================================================
-- 11. BIDDING PACKAGES (~20 gói thầu đa dạng các giai đoạn)
-- ============================================================================
INSERT INTO `tbl_bidding_packages` (`id`, `project_id`, `package_code`, `package_name`, `description`, `budget`, `status`, `deadline`, `criteria`) VALUES
(7, 7, 'BID-VH-001', 'Gói thầu Cung cấp bê tông thương phẩm mác 350-450', 'Cung ứng 120.000m3 bê tông cho phân khu Sapphire', 180000000000.00, 'OPEN', '2026-05-15 17:00:00', '[{"name":"Đơn giá","weight":40},{"name":"Công suất trạm trộn","weight":30},{"name":"Tiến độ giao hàng","weight":20},{"name":"ISO 9001","weight":10}]'),
(8, 7, 'BID-VH-002', 'Gói thầu Hệ thống chiếu sáng thông minh Smart Lighting', 'Lắp đặt 1.200 bộ đèn đường LED năng lượng mặt trời điều khiển IoT', 15000000000.00, 'EVALUATING', '2026-04-20 17:00:00', '[{"name":"Giá","weight":35},{"name":"Tiêu chuẩn quang học","weight":35},{"name":"Bảo hành 5 năm","weight":30}]'),
(9, 8, 'BID-LT-001', 'Gói thầu Cầu ống lồng dẫn khách sân bay (Passenger Boarding Bridges)', 'Cung cấp 42 bộ cầu dẫn hành khách đôi tiêu chuẩn ICAO', 240000000000.00, 'OPEN', '2026-06-30 17:00:00', '[{"name":"Xuất xứ G7","weight":40},{"name":"Giá","weight":30},{"name":"Năng lực bảo trì","weight":30}]'),
(10, 8, 'BID-LT-002', 'Gói thầu Hệ thống kiểm soát an ninh soi chiếu CT Scanner', 'Hệ thống soi chiếu hành lý 3D tự động phát hiện chất nổ', 95000000000.00, 'EVALUATING', '2026-05-01 17:00:00', '[{"name":"Công nghệ TSA","weight":45},{"name":"Giá","weight":25},{"name":"Đào tạo vận hành","weight":30}]'),
(11, 9, 'BID-MT-001', 'Gói thầu Hệ thống thu phí tự động không dừng AFC', 'Cổng soát vé thông minh tích hợp thanh toán thẻ chip EMV và QR Code', 48000000000.00, 'OPEN', '2026-05-25 17:00:00', '[{"name":"Tương thích chuẩn quốc gia","weight":40},{"name":"Giá","weight":30},{"name":"Bảo mật PCI DSS","weight":30}]'),
(12, 10, 'BID-BM-001', 'Gói thầu Hệ thống khí y tế trung tâm và lọc khuẩn HEPA', 'Cung cấp hệ thống oxy lỏng, khí gây mê và phòng vô trùng áp lực dương', 65000000000.00, 'OPEN', '2026-07-15 17:00:00', '[{"name":"Tiêu chuẩn HTM 02-01","weight":40},{"name":"Giá","weight":30},{"name":"Thời gian dự phòng","weight":30}]'),
(13, 11, 'BID-LG-001', 'Gói thầu Điện năng lượng mặt trời áp mái 12.5 MWp', 'Lắp đặt 22.000 tấm pin năng lượng mặt trời Tier-1 trên mái nhà máy', 145000000000.00, 'AWARDED', '2026-03-01 17:00:00', '[{"name":"Hiệu suất tấm pin","weight":40},{"name":"Giá","weight":35},{"name":"Chứng chỉ xanh","weight":25}]'),
(14, 13, 'BID-BT-001', 'Gói thầu Thí nghiệm nén tĩnh cọc khoan nhồi tải trọng 4.500 tấn', 'Thí nghiệm kiểm chứng sức chịu tải cọc sâu 75m ngàm đá gốc', 12000000000.00, 'EVALUATING', '2026-04-18 17:00:00', '[{"name":"Năng lực thiết bị","weight":50},{"name":"Giá","weight":30},{"name":"Kinh nghiệm hầm sâu","weight":20}]'),
(15, 14, 'BID-EX-001', 'Gói thầu Hệ thống âm thanh biểu diễn & ánh sáng sân khấu Hall A', 'Hệ thống loa Line Array d&b audiotechnik và bàn mixer kỹ thuật số', 38000000000.00, 'DRAFT', '2026-08-30 17:00:00', '[{"name":"Thương hiệu G7","weight":40},{"name":"Mô phỏng âm học EASE","weight":35},{"name":"Giá","weight":25}]'),
(16, 15, 'BID-RG-001', 'Gói thầu Thiết kế cảnh quan nhiệt đới & đài phun sương', 'Quy hoạch 15ha cây xanh nhiệt đới kháng gió biển và chiếu sáng sân vườn', 42000000000.00, 'OPEN', '2026-06-10 17:00:00', '[{"name":"Phương án cảnh quan","weight":45},{"name":"Giá","weight":30},{"name":"Chăm sóc 12 tháng","weight":25}]'),
(17, 16, 'BID-SM-001', 'Gói thầu Hệ thống BMS quản lý năng lượng tòa tháp Marina', 'Tích hợp điều khiển thông gió Chiller, chiếu sáng DALI và quan trắc gió bão', 29000000000.00, 'EVALUATING', '2026-04-30 17:00:00', '[{"name":"Tích hợp BACnet/IP","weight":40},{"name":"Giao diện Web/App","weight":30},{"name":"Giá","weight":30}]'),
(18, 17, 'BID-QT-001', 'Gói thầu Cung cấp máy nghiền than và băng tải nhiên liệu', 'Hệ thống tiếp nhận than cám công suất 1.500 tấn/giờ', 185000000000.00, 'OPEN', '2026-07-31 17:00:00', '[{"name":"Độ bền thiết bị","weight":40},{"name":"Giá","weight":30},{"name":"An toàn chống cháy nổ","weight":30}]'),
(19, 18, 'BID-EP-001', 'Gói thầu Hệ thống xử lý nước mặt hồ sinh thái tuần hoàn', 'Công nghệ lọc sinh học Bio-Filter khử rêu mốc dung tích 50.000m3', 35000000000.00, 'AWARDED', '2026-02-28 17:00:00', '[{"name":"Công nghệ thân thiện môi trường","weight":45},{"name":"Giá","weight":35},{"name":"Bảo hành","weight":20}]'),
(20, 21, 'BID-MC-001', 'Gói thầu Cửa chống cháy vân gỗ căn hộ 70 phút', 'Cung cấp 3.200 bộ cửa gỗ công nghiệp chống cháy đạt QCVN 06:2022', 45000000000.00, 'OPEN', '2026-06-20 17:00:00', '[{"name":"Chứng nhận kiểm định PCCC","weight":45},{"name":"Giá","weight":35},{"name":"Thẩm mỹ","weight":20}]'),
(21, 22, 'BID-LH-001', 'Gói thầu 04 cẩu bờ giàn STS bốc dỡ container Super Post-Panamax', 'Cẩu bốc dỡ tầm với 24 hàng container ngoài biển', 620000000000.00, 'DRAFT', '2026-09-30 17:00:00', '[{"name":"Tốc độ bốc xếp","weight":40},{"name":"Tiết kiệm điện","weight":30},{"name":"Giá","weight":30}]')
ON DUPLICATE KEY UPDATE
  `package_name` = VALUES(`package_name`),
  `description` = VALUES(`description`),
  `budget` = VALUES(`budget`),
  `status` = VALUES(`status`);

-- ============================================================================
-- 12. BID SUBMISSIONS (~25 hồ sơ dự thầu liên kết nhà thầu)
-- ============================================================================
INSERT INTO `tbl_bid_submissions` (`id`, `package_id`, `partner_id`, `bid_price`, `status`, `notes`) VALUES
(11, 7, 19, 172000000000.00, 'PENDING', 'Vicem Hà Tiên cam kết 03 trạm trộn vệ tinh tại Hoài Đức và Nam Từ Liêm'),
(12, 7, 12, 178000000000.00, 'PENDING', 'Liên danh Phục Hưng cung cấp bê tông kèm dịch vụ bơm tĩnh đến tầng 40'),
(13, 8, 14, 14200000000.00, 'PENDING', 'REE đề xuất giải pháp đèn Philips kết nối trung tâm điều hành SCADA'),
(14, 8, 23, 14800000000.00, 'PENDING', 'CADIVI cung cấp đồng bộ cáp ngầm chiếu sáng chống thấm nước'),
(15, 9, 21, 232000000000.00, 'PENDING', 'Mitsubishi hợp tác hãng ShinMaywa Nhật Bản cung cấp cầu dẫn cao cấp'),
(16, 10, 15, 91000000000.00, 'PENDING', 'Hawee đề xuất thiết bị Smiths Detection thế hệ mới nhất'),
(17, 10, 17, 93500000000.00, 'PENDING', 'Sigma cam kết thời gian đáp ứng phụ tùng thay thế trong vòng 2 giờ'),
(18, 11, 14, 46500000000.00, 'PENDING', 'Hệ thống thẻ không tiếp xúc tích hợp VNPay và Apple Pay'),
(19, 12, 16, 62000000000.00, 'PENDING', 'Searefico cung ứng trạm oxy lỏng trung tâm 15m3 đạt chuẩn Bộ Y Tế'),
(20, 13, 14, 138000000000.00, 'ACCEPTED', 'REE trúng thầu giải pháp điện mặt trời mái LEGO, bảo hành hiệu suất 25 năm'),
(21, 13, 15, 142000000000.00, 'REJECTED', 'Hawee xếp thứ hai về giá và thời gian hoàn vốn'),
(22, 14, 27, 11500000000.00, 'PENDING', 'SCQC sở hữu dầm thử tải tĩnh 5.000 tấn và kích thủy lực điện tử chuyên dụng'),
(23, 16, 10, 39500000000.00, 'PENDING', 'Central cam kết ươm sẵn cây xanh tại vườn ươm 5ha ở Bến Tre'),
(24, 17, 17, 27800000000.00, 'PENDING', 'Sigma cung cấp giải pháp BMS Johnson Controls Metasys'),
(25, 19, 28, 33500000000.00, 'ACCEPTED', 'Grundfos trúng thầu hệ thống lọc tuần hoàn và bơm nước sinh thái'),
(26, 20, 20, 43000000000.00, 'PENDING', 'Eurowindow đạt chứng chỉ kiểm định mẫu đốt của Cục PCCC 70 phút')
ON DUPLICATE KEY UPDATE `bid_price` = VALUES(`bid_price`), `status` = VALUES(`status`), `notes` = VALUES(`notes`);

-- ============================================================================
-- 13. DRAWINGS (~25 bản vẽ thiết kế kỹ thuật)
-- ============================================================================
INSERT INTO `tbl_drawings` (`id`, `project_id`, `contract_id`, `name`, `drawing_number`, `version`) VALUES
(11, 7, 7, 'Mặt bằng tổng thể tháp S1 tầng 1-10', 'DWG-VH-A101', 'Rev.01'),
(12, 7, 7, 'Chi tiết đài cọc và dầm chuyển tầng 3', 'DWG-VH-S201', 'Rev.02'),
(13, 7, 8, 'Sơ đồ nguyên lý cấp điện trung thế 22kV', 'DWG-VH-E301', 'Rev.01'),
(14, 7, 8, 'Mặt bằng bố trí đầu phun Sprinkler tầng hầm', 'DWG-VH-FP401', 'Rev.03'),
(15, 8, 10, 'Mặt cắt đứng chính nhà ga hành khách T1', 'DWG-LT-ARCH-01', 'Rev.A'),
(16, 8, 10, 'Chi tiết liên kết nút cầu giàn không gian mái', 'DWG-LT-STR-05', 'Rev.B'),
(17, 8, 11, 'Sơ đồ định tuyến băng tải hành lý ngầm', 'DWG-LT-BHS-02', 'Rev.A'),
(18, 9, 13, 'Mặt cắt hầm đôi khoan ngầm TBM Km12+450', 'DWG-MT-TBM-01', 'Rev.C'),
(19, 9, 14, 'Sơ đồ hệ thống quạt thông gió phản lực Jet Fan', 'DWG-MT-VENT-04', 'Rev.A'),
(20, 10, 15, 'Mặt bằng công năng khu vực hồi sức cấp cứu ICU', 'DWG-BM-ICU-01', 'Rev.01'),
(21, 10, 15, 'Sơ đồ đường ống khí y tế O2/Air/Vac', 'DWG-BM-GAS-02', 'Rev.01'),
(22, 11, 16, 'Mặt bằng lưới cột nhà kho High-Bay 32m', 'DWG-LG-WH-01', 'Rev.B'),
(23, 11, 17, 'Sơ đồ hệ thống lọc khí AHU phòng sạch Class 1000', 'DWG-LG-HVAC-03', 'Rev.A'),
(24, 13, 18, 'Mặt bằng định vị tường vây D1000 hầm sâu 5 tầng', 'DWG-BT-DIAPH-01', 'Rev.A'),
(25, 14, 19, 'Bản vẽ phối cảnh kết cấu vòm thép nhịp 120m Hall A', 'DWG-EX-TRUSS-01', 'Rev.A'),
(26, 15, 20, 'Chi tiết cấu tạo hồ bơi tràn viền biệt thự biển', 'DWG-RG-POOL-02', 'Rev.02'),
(27, 16, 21, 'Chi tiết liên kết modul kính Unitized chịu gió bão', 'DWG-SM-CW-01', 'Rev.B'),
(28, 17, 22, 'Sơ đồ bố trí ống giải nhiệt bê tông khối lớn đài móng', 'DWG-QT-COOL-01', 'Rev.A'),
(29, 21, 24, 'Mặt bằng phân chia căn hộ tháp Gardenia tầng 6-25', 'DWG-MAS-TYP-01', 'Rev.01'),
(30, 22, 25, 'Mặt bằng bố trí 210 tim cọc SPP bến cập tàu 100.000 DWT', 'DWG-LH-PILE-01', 'Rev.A')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `version` = VALUES(`version`);

-- ============================================================================
-- 14. TECHNICAL STANDARDS (~25 tiêu chuẩn quy chuẩn xây dựng Việt Nam)
-- ============================================================================
INSERT INTO `tbl_technical_standards` (`id`, `code`, `name`, `description`, `category`, `version`, `project_id`) VALUES
(9, 'TCVN 5574:2018', 'Thiết kế kết cấu bê tông và bê tông cốt thép', 'Quy định tính toán độ bền, độ võng và vết nứt kết cấu BTCT', 'Kết cấu', '2018', 7),
(10, 'QCVN 06:2022/BXD', 'Quy chuẩn kỹ thuật quốc gia về An toàn cháy cho nhà và công trình', 'Quy chuẩn bắt buộc về lối thoát nạn, khoang cháy và vật liệu chống cháy', 'PCCC', '2022', 7),
(11, 'TCVN 2737:2023', 'Tải trọng và tác động - Tiêu chuẩn thiết kế', 'Quy định tải trọng gió bão mới nhất và hoạt tải sử dụng sàn', 'Kết cấu', '2023', 8),
(12, 'TCVN 9386:2012', 'Thiết kế công trình chịu động đất', 'Quy chuẩn tính toán kháng chấn cho nhà cao tầng và sân bay', 'Kết cấu', '2012', 8),
(13, 'TCVN 9362:2012', 'Tiêu chuẩn thiết kế nền nhà và công trình', 'Tính toán sức chịu tải nền đất và độ lún giới hạn công trình', 'Địa kỹ thuật', '2012', 9),
(14, 'TCVN 10304:2014', 'Móng cọc - Tiêu chuẩn thiết kế', 'Tính toán sức chịu tải cọc khoan nhồi và cọc ép trong đất đá', 'Địa kỹ thuật', '2014', 13),
(15, 'TCVN 7447:2018', 'Hệ thống lắp đặt điện hạ áp', 'Quy chuẩn an toàn điện gia dụng và thương mại', 'Cơ điện MEP', '2018', 7),
(16, 'TCVN 3890:2023', 'PCCC - Phương tiện phòng cháy và chữa cháy cho nhà và công trình', 'Quy định trang bị bình chữa cháy, họng nước và lăng phun', 'PCCC', '2023', 10),
(17, 'QCVN 09:2017/BXD', 'Các công trình xây dựng sử dụng năng lượng hiệu quả', 'Quy chuẩn vỏ bao che, điều hòa và chiếu sáng tiết kiệm điện', 'Công trình xanh', '2017', 11),
(18, 'TCVN 9377-1:2012', 'Công tác hoàn thiện trong xây dựng - Trát và láng', 'Yêu cầu độ phẳng bề mặt và độ bám dính của vữa xây tô', 'Hoàn thiện', '2012', 7),
(19, 'TCVN 4453:1995', 'Kết cấu bê tông cốt thép toàn khối - Quy phạm thi công và nghiệm thu', 'Tiêu chuẩn thi công, bảo dưỡng và nghiệm thu cốp pha cốt thép', 'Kết cấu', '1995', 8),
(20, 'TCVN 8793:2011', 'Sơn tường dạng nhũ tương - Yêu cầu kỹ thuật', 'Độ phủ, độ bền thời tiết và hàm lượng VOC an toàn sức khỏe', 'Vật liệu', '2011', 15),
(21, 'TCVN 9379:2012', 'Kết cấu xây dựng - Đánh giá độ bền và độ an toàn', 'Quy trình kiểm định và đánh giá chất lượng công trình đang khai thác', 'Kiểm định', '2012', 17),
(22, 'TCVN 5687:2010', 'Thông gió - Điều hòa không khí - Tiêu chuẩn thiết kế', 'Lưu lượng gió tươi và kiểm soát độ ẩm phòng sạch', 'Cơ điện MEP', '2010', 11),
(23, 'TCVN 4513:1988', 'Cấp nước bên trong - Tiêu chuẩn thiết kế', 'Quy định áp lực nước vòi cấp và dung tích bể chứa ngầm', 'Cấp thoát nước', '1988', 7),
(24, 'TCVN 4474:1987', 'Thoát nước bên trong - Tiêu chuẩn thiết kế', 'Quy định đường kính ống thoát phân, thoát sàn và ống thông hơi', 'Cấp thoát nước', '1987', 7),
(25, 'TCVN 9361:2012', 'Công tác nền móng - Quy phạm thi công và nghiệm thu', 'Yêu cầu đào hố móng, đắp đất đầm nén đạt độ chặt K95-K98', 'Hạ tầng', '2012', 18)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`), `category` = VALUES(`category`);

-- ============================================================================
-- 15. MATERIAL REQUESTS (~25 yêu cầu cấp phát xuất kho)
-- ============================================================================
INSERT INTO `tbl_material_requests` (`id`, `project_id`, `requester_id`, `material_id`, `requested_quantity`, `status`, `notes`) VALUES
(8, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 6, 800.0, 'APPROVED', 'Xi măng đổ bê tông sàn tầng 5 tháp S1'),
(9, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 7, 120.0, 'APPROVED', 'Cát vàng sàng sạch phục vụ trộn vữa xây tầng 2'),
(10, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 8, 45000.0, 'APPROVED', 'Gạch ống 4 lỗ xây tường bao căn hộ Sapphire'),
(11, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 9, 3500.0, 'CHECKED', 'Thép cuộn D8 làm thép đai cột dầm'),
(12, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_trung' LIMIT 1), 16, 600.0, 'APPROVED', 'Cáp điện CXV 4x16 cấp nguồn tủ tầng'),
(13, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_trung' LIMIT 1), 17, 300.0, 'APPROVED', 'Ống luồn PVC 20mm đi âm sàn tầng 6'),
(14, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), 31, 150.0, 'APPROVED', 'Mũ bảo hộ công trường cấp cho đội thợ sắt'),
(15, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), 32, 120.0, 'APPROVED', 'Giày bảo hộ mũi thép chống đinh cho công nhân mới'),
(16, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), 6, 1200.0, 'APPROVED', 'Xi măng mác cao đổ đài móng nhà ga Long Thành'),
(17, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), 9, 8500.0, 'APPROVED', 'Thép cuộn D8 gia công lồng thép cọc D1500'),
(18, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_trung' LIMIT 1), 21, 250.0, 'PENDING', 'Ống uPVC D90 thoát nước mái sảnh'),
(19, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), 33, 200.0, 'APPROVED', 'Áo phản quang đạt chuẩn ban đêm khu bay'),
(20, 9, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), 6, 500.0, 'APPROVED', 'Vữa chèn vòm hầm khoan TBM tuyến Metro 1'),
(21, 10, (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), 18, 180.0, 'CHECKED', 'Đèn LED Panel 600x600 phòng khám đa khoa'),
(22, 11, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 7, 250.0, 'APPROVED', 'Cát vàng đổ sàn phẳng siêu phẳng nhà xưởng LEGO'),
(23, 11, (SELECT id FROM `tbl_users` WHERE username = 'staff_trung' LIMIT 1), 22, 6.0, 'APPROVED', 'Cụm máy bơm tăng áp tầng mái khu xử lý nước'),
(24, 13, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 9, 12000.0, 'PENDING', 'Thép tấm chịu lực chế tạo lồng tường vây hầm Bitexco'),
(25, 14, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), 26, 2000.0, 'APPROVED', 'Bulong M10x50 liên kết bản mã giàn không gian'),
(26, 15, (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), 23, 80.0, 'APPROVED', 'Phễu thu sàn Inox 304 chống mùi resort Regent'),
(27, 16, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), 27, 1500.0, 'APPROVED', 'Tắc kê sắt M8 treo vách kính Unitized Marina'),
(28, 18, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 10, 350.0, 'APPROVED', 'Đá 1x2 cấp phối bê tông kè bờ Ecopark'),
(29, 21, (SELECT id FROM `tbl_users` WHERE username = 'staff_tuananh' LIMIT 1), 8, 60000.0, 'APPROVED', 'Gạch ống xây tường Masteri Centre Point'),
(30, 22, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), 29, 100.0, 'PENDING', 'Que hàn chịu mặn 3.2mm hàn cọc SPP ngoài khơi')
ON DUPLICATE KEY UPDATE `requested_quantity` = VALUES(`requested_quantity`), `status` = VALUES(`status`), `notes` = VALUES(`notes`);

-- ============================================================================
-- 16. WORK LOGS (~25 nhật ký công trường phong phú thực tế)
-- ============================================================================
INSERT INTO `tbl_work_logs` (`id`, `project_id`, `user_id`, `log_date`, `weather_condition`, `worker_count`, `content`, `status`, `checked_by`, `approved_by`, `checked_at`, `approved_at`, `notes`) VALUES
(201, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-01', 'Nắng đẹp, nhiệt độ 28°C', 54, 'Đổ bê tông sàn tầng 5 tháp S1 khối lượng 350m3 mác 350. Lấy 06 tổ mẫu nén 7 và 28 ngày.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_an' LIMIT 1), '2026-04-01 17:00:00', '2026-04-01 18:30:00', 'Bảo dưỡng ẩm liên tục 72 giờ'),
(202, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-02', 'Nắng ráo, gió nhẹ', 48, 'Lắp dựng cốt thép và cốp pha cột vách trục 2-8 tầng 6. Kiểm tra khoảng bảo vệ đạt 3cm.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_an' LIMIT 1), '2026-04-02 17:15:00', '2026-04-02 18:00:00', 'Đạt nghiệm thu trước khi đổ bê tông'),
(203, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_trung' LIMIT 1), '2026-04-03', 'Trời trong, nhiệt độ 29°C', 36, 'Kéo rải cáp ngầm trung thế từ trạm biến áp đến phòng điện tổng tháp S1. Thử thông mạch đạt 100%.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_an' LIMIT 1), '2026-04-03 16:45:00', '2026-04-03 17:45:00', 'Bọc bảo vệ đầu cáp chống ẩm'),
(204, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), '2026-04-04', 'Nhiều mây, se mát', 42, 'Xây tường ngăn căn hộ mẫu tầng 2 bằng gạch ống. Kiểm tra mạch vữa đầy và độ thẳng đứng quả dọi.', 'CHECKED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), NULL, '2026-04-04 17:30:00', NULL, 'Chờ PM duyệt hoàn công'),
(205, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), '2026-04-01', 'Nắng nóng, nhiệt độ 34°C', 78, 'Khoan nhồi cọc D1500 tim cọc P45 sâu 60m khu vực sảnh đi quốc tế. Dung dịch Bentonite tỷ trọng 1.08.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_linh' LIMIT 1), '2026-04-01 18:00:00', '2026-04-01 19:00:00', 'Bơm vữa đáy cọc áp lực cao đạt chuẩn'),
(206, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), '2026-04-02', 'Nắng gắt, nhiệt độ 35°C', 82, 'Gia công và hạ lồng thép cọc khoan nhồi P46. Siêu âm kiểm tra 4 ống thép thông suốt.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_linh' LIMIT 1), '2026-04-02 17:45:00', '2026-04-02 18:45:00', 'Nghiệm thu mối hàn cọc đầy đủ'),
(207, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_tuananh' LIMIT 1), '2026-04-03', 'Mưa rào buổi chiều', 65, 'Đổ bê tông lót đài móng M1-M6 khu vực ga đến. Che bạt kịp thời khi mưa rào, bề mặt không bị xói.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_linh' LIMIT 1), '2026-04-03 17:00:00', '2026-04-03 18:15:00', 'Bảo dưỡng ẩm bề mặt sau mưa'),
(208, 9, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), '2026-04-01', 'Thời tiết hầm ngầm 26°C', 45, 'Vận hành robot khiên đào TBM số 2 khoan ngầm 14 mét tuyến Bến Thành. Lắp đặt 09 vòng vỏ hầm Segment.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_tuan' LIMIT 1), '2026-04-01 18:30:00', '2026-04-01 20:00:00', 'Bơm vữa chèn lưng vỏ hầm đạt áp 2.5 bar'),
(209, 9, (SELECT id FROM `tbl_users` WHERE username = 'staff_viet' LIMIT 1), '2026-04-02', 'Thời tiết hầm ngầm 26°C', 38, 'Lắp đặt giá đỡ đường ống cứu hỏa vách hầm phân đoạn Km1+200. Bắn tắc kê hóa chất Hilti đạt tải kéo 15kN.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_tuan' LIMIT 1), '2026-04-02 17:30:00', '2026-04-02 18:30:00', 'Thử tải ngẫu nhiên 5 điểm đạt 100%'),
(210, 10, (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), '2026-04-02', 'Nắng nhẹ, nhiệt độ 27°C', 50, 'Lắp dựng panel vô trùng phòng mổ số 3 và 4. Xử lý mối nối keo silicone y tế chống bám bụi.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_trung' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_hai' LIMIT 1), '2026-04-02 17:15:00', '2026-04-02 18:00:00', 'Chuẩn bị kiểm định vi sinh phòng sạch'),
(211, 11, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-03', 'Nắng ráo, nhiệt độ 31°C', 60, 'Đổ bê tông sàn siêu phẳng SuperFlat khu kho tự động High-Bay. Máy cào Laser Screed vận hành ổn định.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_long' LIMIT 1), '2026-04-03 18:00:00', '2026-04-03 19:15:00', 'Đo độ phẳng Fmin đạt tiêu chuẩn ACI 117'),
(212, 11, (SELECT id FROM `tbl_users` WHERE username = 'staff_lan' LIMIT 1), '2026-04-04', 'Trời trong, gió nhẹ', 35, 'Thử áp lực đường ống nước Chiller khu vực nhà xưởng A1. Áp kế giữ 10 bar trong 24 giờ không tụt.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_long' LIMIT 1), '2026-04-04 16:30:00', '2026-04-04 17:30:00', 'Ký biên bản thử kín đường ống'),
(213, 13, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-05', 'Nắng nóng, nhiệt độ 33°C', 52, 'Thi công đào đất tầng hầm B1 bằng máy đào gầu ngoạm kết hợp hệ văng chống Shoring Kingpost.', 'CHECKED', (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), NULL, '2026-04-05 17:00:00', NULL, 'Quan trắc lún nghiêng chuyển vị tường vây bình thường'),
(214, 14, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), '2026-04-06', 'Gió mát, nhiều mây', 58, 'Cẩu lắp 02 cụm giàn không gian nhịp 60m sảnh triển lãm Hall A. Dùng 2 cẩu bánh xích 250 tấn đồng bộ.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_tuan' LIMIT 1), '2026-04-06 18:30:00', '2026-04-06 19:45:00', 'Siết bu lông lực cường độ cao đúng mô-men'),
(215, 15, (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), '2026-04-07', 'Nắng biển, nhiệt độ 30°C', 40, 'Thi công ốp đá tự nhiên Sukabumi hồ bơi biệt thự biển Villa 12. Kiểm tra độ phẳng và chống thấm 3 lớp.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_linh' LIMIT 1), '2026-04-07 17:30:00', '2026-04-07 18:15:00', 'Ngâm thử nước hồ bơi 48 giờ'),
(216, 16, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), '2026-04-08', 'Gió biển cấp 3, nắng nhẹ', 46, 'Lắp dựng 18 tấm kính hộp Unitized mặt ngoài tầng 12 tháp Marina. Kiểm tra gioăng EPDM và đường keo bơm kín khít.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_tuan' LIMIT 1), '2026-04-08 17:00:00', '2026-04-08 18:00:00', 'Test áp lực nước vòi phun đạt kín nước'),
(217, 17, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-09', 'Nắng ráo, gió Tây Nam', 68, 'Đổ bê tông khối lớn đài móng lò hơi 1.200m3. Theo dõi nhiệt độ bê tông qua cảm biến nhiệt độ không vượt quá 65°C.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_hai' LIMIT 1), '2026-04-09 20:00:00', '2026-04-09 21:30:00', 'Chênh lệch nhiệt độ tâm và mặt ngoài < 20°C'),
(218, 18, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-10', 'Nắng nhẹ, nhiệt độ 26°C', 38, 'Thi công kè sinh thái đá hộc kết hợp thảm thực vật thủy sinh quanh đảo lớn. Đầm nén chân kè chặt chẽ.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_hai' LIMIT 1), '2026-04-10 16:45:00', '2026-04-10 17:30:00', 'Nghiệm thu cao độ đỉnh kè K95'),
(219, 21, (SELECT id FROM `tbl_users` WHERE username = 'staff_tuananh' LIMIT 1), '2026-04-11', 'Trời nắng, nhiệt độ 32°C', 70, 'Lắp đặt cốp pha nhôm tầng 18 tháp Gardenia. Hoàn thành lắp dựng trong 2 ngày, chuẩn bị đổ bê tông sàn.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_tuananh' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_long' LIMIT 1), '2026-04-11 17:45:00', '2026-04-11 18:45:00', 'Đảm bảo chu kỳ 5 ngày/sàn'),
(220, 22, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), '2026-04-12', 'Biển lặng, sóng êm', 55, 'Đóng 04 cọc ống thép SPP D1200 sâu 45m ngoài biển bằng búa rung thủy lực. Kiểm tra độ chối cọc đạt yêu cầu.', 'APPROVED', (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), (SELECT id FROM `tbl_users` WHERE username = 'pm_an' LIMIT 1), '2026-04-12 18:00:00', '2026-04-12 19:15:00', 'Đo đạc vị trí cọc bằng máy toàn đạc điện tử')
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `weather_condition` = VALUES(`weather_condition`), `status` = VALUES(`status`), `worker_count` = VALUES(`worker_count`), `notes` = VALUES(`notes`);

-- ============================================================================
-- 17. SHIFT ASSIGNMENTS & ATTENDANCE LOGS (~25 ca trực và chấm công thực tế)
-- ============================================================================
INSERT INTO `tbl_shift_assignments` (`id`, `shift_template_id`, `project_id`, `user_id`, `work_date`, `status`, `notes`) VALUES
(201, 1, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-01', 'COMPLETED', 'Ca hành chính giám sát đổ bê tông sàn T5'),
(202, 1, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), '2026-04-01', 'COMPLETED', 'Trực an toàn lao động ca sáng tháp S1'),
(203, 1, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_trung' LIMIT 1), '2026-04-02', 'COMPLETED', 'Kéo rải cáp trung thế trạm biến áp'),
(204, 1, 7, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), '2026-04-02', 'COMPLETED', 'Nghiệm thu khối lượng xây tường'),
(205, 1, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), '2026-04-01', 'COMPLETED', 'Giám sát khoan cọc D1500 Long Thành'),
(206, 1, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), '2026-04-01', 'COMPLETED', 'Kiểm tra an toàn xe máy thiết bị khu bay'),
(207, 1, 8, (SELECT id FROM `tbl_users` WHERE username = 'staff_tuananh' LIMIT 1), '2026-04-02', 'COMPLETED', 'Giám sát đổ bê tông đài móng ga đến'),
(208, 1, 9, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), '2026-04-01', 'COMPLETED', 'Trực ca máy đào TBM hầm ngầm Metro'),
(209, 1, 9, (SELECT id FROM `tbl_users` WHERE username = 'staff_viet' LIMIT 1), '2026-04-02', 'COMPLETED', 'Giám sát lắp ống cứu hỏa vách hầm'),
(210, 1, 10, (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), '2026-04-02', 'COMPLETED', 'Lắp panel phòng mổ Bạch Mai 2'),
(211, 1, 11, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-03', 'COMPLETED', 'Đổ sàn SuperFlat nhà máy LEGO'),
(212, 1, 11, (SELECT id FROM `tbl_users` WHERE username = 'staff_lan' LIMIT 1), '2026-04-03', 'COMPLETED', 'Thử áp đường ống Chiller nhà xưởng'),
(213, 1, 13, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-05', 'COMPLETED', 'Giám sát đào đất hầm Bitexco Tower 2'),
(214, 1, 14, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), '2026-04-06', 'COMPLETED', 'Cẩu giàn không gian sảnh Hall A'),
(215, 1, 15, (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), '2026-04-07', 'COMPLETED', 'Ốp đá hồ bơi biệt thự biển Regent'),
(216, 1, 16, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), '2026-04-08', 'COMPLETED', 'Lắp kính Unitized tháp Marina'),
(217, 1, 17, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-09', 'COMPLETED', 'Theo dõi nhiệt độ móng nhiệt điện'),
(218, 1, 18, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), '2026-04-10', 'COMPLETED', 'Kè sinh thái đảo lớn Ecopark'),
(219, 1, 21, (SELECT id FROM `tbl_users` WHERE username = 'staff_tuananh' LIMIT 1), '2026-04-11', 'COMPLETED', 'Cốp pha nhôm tháp Gardenia Masteri'),
(220, 1, 22, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), '2026-04-12', 'COMPLETED', 'Đóng cọc ống thép SPP Lạch Huyện')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`), `notes` = VALUES(`notes`);

INSERT INTO `tbl_attendance_logs` (`id`, `user_id`, `project_id`, `check_in_at`, `check_out_at`, `gps_lat_in`, `gps_long_in`, `gps_lat_out`, `gps_long_out`, `distance_in_meters`, `selfie_url_in`, `status`, `shift_assignment_id`, `scheduled_start_at`, `scheduled_end_at`, `late_minutes`, `early_leave_minutes`, `overtime_minutes`, `remarks`) VALUES
(201, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 7, '2026-04-01 07:55:12', '2026-04-01 17:35:45', 21.002820, 105.748530, 21.002825, 105.748535, 12.5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'PRESENT', 201, '2026-04-01 08:00:00', '2026-04-01 17:30:00', 0, 0, 5, 'Face-ID 99.2% hợp lệ - Cổng chính Sapphire'),
(202, (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), 7, '2026-04-01 07:48:30', '2026-04-01 17:32:10', 21.002810, 105.748520, 21.002815, 105.748525, 8.2, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'PRESENT', 202, '2026-04-01 08:00:00', '2026-04-01 17:30:00', 0, 0, 2, 'Face-ID 98.7% - Văn phòng an toàn HSE'),
(203, (SELECT id FROM `tbl_users` WHERE username = 'staff_trung' LIMIT 1), 7, '2026-04-02 08:05:10', '2026-04-02 17:40:00', 21.002815, 105.748535, 21.002820, 105.748540, 15.0, 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'LATE', 203, '2026-04-02 08:00:00', '2026-04-02 17:30:00', 5, 0, 10, 'Face-ID 97.9% - Đi muộn 5 phút do giao thông'),
(204, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), 7, '2026-04-02 07:52:00', '2026-04-02 17:30:00', 21.002822, 105.748528, 21.002820, 105.748530, 9.4, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'PRESENT', 204, '2026-04-02 08:00:00', '2026-04-02 17:30:00', 0, 0, 0, 'Face-ID 99.5% - Đúng giờ'),
(205, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), 8, '2026-04-01 07:45:20', '2026-04-01 18:00:00', 10.781260, 107.013550, 10.781255, 107.013545, 18.2, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'OVERTIME', 205, '2026-04-01 08:00:00', '2026-04-01 17:30:00', 0, 0, 30, 'Face-ID 99.1% - Tăng ca theo dõi đổ bê tông cọc'),
(206, (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), 8, '2026-04-01 07:50:00', '2026-04-01 17:30:00', 10.781250, 107.013540, 10.781250, 107.013540, 5.0, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'PRESENT', 206, '2026-04-01 08:00:00', '2026-04-01 17:30:00', 0, 0, 0, 'Face-ID 98.4% - Cổng kiểm soát số 2'),
(207, (SELECT id FROM `tbl_users` WHERE username = 'staff_tuananh' LIMIT 1), 8, '2026-04-02 07:58:15', '2026-04-02 17:35:00', 10.781255, 107.013545, 10.781260, 107.013550, 11.0, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'PRESENT', 207, '2026-04-02 08:00:00', '2026-04-02 17:30:00', 0, 0, 5, 'Face-ID 99.0% - Hợp lệ'),
(208, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), 9, '2026-04-01 07:40:00', '2026-04-01 17:30:00', 10.772545, 106.698015, 10.772540, 106.698010, 7.5, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'PRESENT', 208, '2026-04-01 08:00:00', '2026-04-01 17:30:00', 0, 0, 0, 'Face-ID 98.9% - Ga ngầm Bến Thành'),
(209, (SELECT id FROM `tbl_users` WHERE username = 'staff_viet' LIMIT 1), 9, '2026-04-02 07:54:30', '2026-04-02 17:32:00', 10.772542, 106.698012, 10.772540, 106.698010, 6.2, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'PRESENT', 209, '2026-04-02 08:00:00', '2026-04-02 17:30:00', 0, 0, 2, 'Face-ID 99.3% - Hợp lệ'),
(210, (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), 10, '2026-04-02 07:56:00', '2026-04-02 17:30:00', 20.537215, 105.918525, 20.537210, 105.918520, 8.0, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'PRESENT', 210, '2026-04-02 08:00:00', '2026-04-02 17:30:00', 0, 0, 0, 'Face-ID 98.6% - Khối nhà khám Bạch Mai 2'),
(211, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 11, '2026-04-03 07:45:00', '2026-04-03 18:30:00', 11.084535, 106.758215, 11.084540, 106.758220, 14.5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'OVERTIME', 211, '2026-04-03 08:00:00', '2026-04-03 17:30:00', 0, 0, 60, 'Face-ID 99.4% - Tăng ca theo dõi cào phẳng Laser'),
(212, (SELECT id FROM `tbl_users` WHERE username = 'staff_lan' LIMIT 1), 11, '2026-04-03 07:51:20', '2026-04-03 17:31:00', 11.084530, 106.758210, 11.084532, 106.758212, 5.8, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'PRESENT', 212, '2026-04-03 08:00:00', '2026-04-03 17:30:00', 0, 0, 1, 'Face-ID 99.0% - Hợp lệ'),
(213, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 13, '2026-04-05 07:53:00', '2026-04-05 17:30:00', 10.771825, 106.704415, 10.771820, 106.704410, 6.0, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'PRESENT', 213, '2026-04-05 08:00:00', '2026-04-05 17:30:00', 0, 0, 0, 'Face-ID 99.1% - Tòa nhà Bitexco 2'),
(214, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), 14, '2026-04-06 07:49:00', '2026-04-06 17:35:00', 21.112345, 105.852415, 21.112340, 105.852410, 10.0, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'PRESENT', 214, '2026-04-06 08:00:00', '2026-04-06 17:30:00', 0, 0, 5, 'Face-ID 99.6% - Đúng giờ'),
(215, (SELECT id FROM `tbl_users` WHERE username = 'staff_duy' LIMIT 1), 15, '2026-04-07 07:58:00', '2026-04-07 17:30:00', 10.125635, 103.985625, 10.125630, 103.985620, 9.2, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'PRESENT', 215, '2026-04-07 08:00:00', '2026-04-07 17:30:00', 0, 0, 0, 'Face-ID 98.8% - Ban chỉ huy Regent'),
(216, (SELECT id FROM `tbl_users` WHERE username = 'staff_khoa' LIMIT 1), 16, '2026-04-08 07:55:00', '2026-04-08 17:30:00', 20.951235, 107.054325, 20.951230, 107.054320, 8.5, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'PRESENT', 216, '2026-04-08 08:00:00', '2026-04-08 17:30:00', 0, 0, 0, 'Face-ID 99.2% - Cổng công trường Sun Marina'),
(217, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 17, '2026-04-09 07:42:00', '2026-04-09 17:30:00', 17.884515, 106.452145, 17.884510, 106.452140, 12.0, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'PRESENT', 217, '2026-04-09 08:00:00', '2026-04-09 17:30:00', 0, 0, 0, 'Face-ID 98.5% - Quảng Trạch 1'),
(218, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 18, '2026-04-10 07:50:00', '2026-04-10 17:30:00', 20.965415, 105.932125, 20.965410, 105.932120, 7.8, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'PRESENT', 218, '2026-04-10 08:00:00', '2026-04-10 17:30:00', 0, 0, 0, 'Face-ID 99.0% - Ecopark Hưng Yên'),
(219, (SELECT id FROM `tbl_users` WHERE username = 'staff_tuananh' LIMIT 1), 21, '2026-04-11 07:47:00', '2026-04-11 17:30:00', 10.845615, 106.839825, 10.845610, 106.839820, 10.2, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'PRESENT', 219, '2026-04-11 08:00:00', '2026-04-11 17:30:00', 0, 0, 0, 'Face-ID 99.3% - Masteri Centre Point'),
(220, (SELECT id FROM `tbl_users` WHERE username = 'staff_phuc' LIMIT 1), 22, '2026-04-12 07:38:00', '2026-04-12 17:30:00', 20.845635, 106.912345, 20.845630, 106.912340, 15.0, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'PRESENT', 220, '2026-04-12 08:00:00', '2026-04-12 17:30:00', 0, 0, 0, 'Face-ID 98.7% - Cảng Lạch Huyện')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`), `remarks` = VALUES(`remarks`);

-- ============================================================================
-- 18. NOTIFICATIONS (~20 thông báo hoạt động hệ thống)
-- ============================================================================
INSERT INTO `tbl_notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 1, 'Hợp đồng mới cần phê duyệt', 'Hợp đồng HD-2026/VH-CT01 với Coteccons đã chuyển sang bước 4 ký kết.', 'CONTRACT', FALSE, '2026-04-01 08:30:00'),
(2, (SELECT id FROM `tbl_users` WHERE username = 'pm_an' LIMIT 1), 'Nhật ký thi công đã được duyệt', 'Nhật ký thi công ngày 01/04/2026 tại Vinhomes Smart City đã được chỉ huy trưởng phê duyệt.', 'WORK_LOG', TRUE, '2026-04-01 19:00:00'),
(3, (SELECT id FROM `tbl_users` WHERE username = 'pm_linh' LIMIT 1), 'Tiến độ cọc khoan nhồi Long Thành', 'Đã hoàn thành thi công tim cọc P45 sảnh đi quốc tế đạt chất lượng thiết kế.', 'PROJECT', FALSE, '2026-04-01 19:15:00'),
(4, (SELECT id FROM `tbl_users` WHERE username = 'pm_tuan' LIMIT 1), 'Báo cáo tiến độ đào hầm TBM', 'Robot khiên đào TBM số 2 đã lắp xong 09 vòng vỏ hầm Segment trong ngày.', 'PROJECT', TRUE, '2026-04-01 20:30:00'),
(5, 1, 'Mở gói thầu mới', 'Gói thầu Cung cấp bê tông thương phẩm Sapphire (BID-VH-001) đã mở tiếp nhận hồ sơ.', 'BIDDING', FALSE, '2026-04-02 09:00:00'),
(6, (SELECT id FROM `tbl_users` WHERE username = 'partner_duc' LIMIT 1), 'Tiếp nhận hồ sơ dự thầu', 'Hồ sơ dự thầu của Coteccons cho gói hoàn thiện tháp đã được hệ thống ghi nhận.', 'BIDDING', TRUE, '2026-04-02 10:15:00'),
(7, (SELECT id FROM `tbl_users` WHERE username = 'staff_minh' LIMIT 1), 'Phê duyệt cấp phát vật tư', 'Yêu cầu 800 bao xi măng PC40 cho sàn T5 tháp S1 đã được thủ kho xuất kho.', 'MATERIAL', TRUE, '2026-04-02 11:30:00'),
(8, (SELECT id FROM `tbl_users` WHERE username = 'staff_dat' LIMIT 1), 'Cảnh báo an toàn lao động', 'Nhắc nhở kiểm tra dây cứu sinh giàn giáo hoàn thiện ngoài trục 2-8.', 'SAFETY', FALSE, '2026-04-02 14:00:00'),
(9, (SELECT id FROM `tbl_users` WHERE username = 'pm_long' LIMIT 1), 'Nghiệm thu sàn siêu phẳng LEGO', 'Đo đạc chỉ số Fmin sàn kho High-Bay đã hoàn tất đạt chuẩn ACI 117.', 'QUALITY', TRUE, '2026-04-03 19:30:00'),
(10, (SELECT id FROM `tbl_users` WHERE username = 'pm_hai' LIMIT 1), 'Báo cáo nhiệt độ móng nhiệt điện', 'Nhiệt độ tâm móng lò hơi Quảng Trạch 1 ghi nhận 62°C, nằm trong ngưỡng an toàn.', 'QUALITY', FALSE, '2026-04-09 21:45:00')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `message` = VALUES(`message`);

SET FOREIGN_KEY_CHECKS = 1;
