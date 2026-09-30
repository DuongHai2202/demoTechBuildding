-- Repair sample work logs that were imported with a non-Unicode connection.
-- Keep the correction in Flyway so a fresh environment and the current demo DB
-- receive the same Vietnamese data.

ALTER TABLE `tbl_work_logs`
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

UPDATE `tbl_work_logs`
SET
  `weather_condition` = CASE `id`
    WHEN 101 THEN 'Nắng nhẹ, nhiệt độ 28°C'
    WHEN 102 THEN 'Nhiều mây, gió nhẹ'
    WHEN 103 THEN 'Nắng ráo, nhiệt độ 30°C'
    WHEN 104 THEN 'Mưa rào buổi chiều'
    WHEN 105 THEN 'Trời trong, nhiệt độ 26°C'
    WHEN 106 THEN 'Nhiều mây, se lạnh'
    WHEN 107 THEN 'Nắng đẹp, nhiệt độ 27°C'
    WHEN 108 THEN 'Nắng nóng, nhiệt độ 32°C'
  END,
  `content` = CASE `id`
    WHEN 101 THEN 'Đổ bê tông sàn tầng hầm B1 phân khu Zone A, khối lượng 320m3 mác 350. Kiểm tra độ sụt đạt 12cm.'
    WHEN 102 THEN 'Lắp dựng cốt thép và cốp pha cột trục A-D tầng 2. Nghiệm thu nội bộ trước khi đổ bê tông.'
    WHEN 103 THEN 'Thi công đường ống cấp thoát nước âm sàn tầng 3. Thử áp lực đường ống đạt 10 bar trong 24 giờ.'
    WHEN 104 THEN 'Gia công lắp đặt hệ thống thang máng cáp điện trục kỹ thuật tầng 4. Che chắn vật tư chống bụi bẩn.'
    WHEN 105 THEN 'Đổ bê tông dầm sàn tầng 5 tháp A. Sử dụng 2 bơm cần 52m, thời gian thi công từ 08:00 đến 16:30.'
    WHEN 106 THEN 'Bảo dưỡng ẩm bê tông sàn tầng 5. Tháo dỡ cốp pha dầm sàn tầng 3 sau 14 ngày đạt cường độ thiết kế.'
    WHEN 107 THEN 'Lắp dựng giàn giáo hoàn thiện mặt ngoài trục 1-10. Kiểm tra an toàn dây cứu sinh và lưới chắn rơi.'
    WHEN 108 THEN 'Thi công xây tường ngăn chia căn hộ tầng 2. Vật liệu gạch không nung XMCL, vữa xi măng mác 75.'
  END
WHERE `id` BETWEEN 101 AND 108;

-- Additional demo rows make filtering, empty states and pagination easy to test.
INSERT IGNORE INTO `tbl_work_logs`
  (`id`, `project_id`, `user_id`, `log_date`, `weather_condition`, `worker_count`, `content`, `status`, `created_by`, `updated_by`)
VALUES
  (109, 1, 1, '2026-03-09', 'Nắng nhẹ, nhiệt độ 29°C', 32, 'Nghiệm thu công tác cốt thép sàn tầng 2 khu A trước khi đổ bê tông.', 'APPROVED', 'admin1', 'admin1'),
  (110, 2, 2, '2026-03-10', 'Có mây, gió nhẹ', 28, 'Lắp đặt cốt thép dầm tầng 6 và kiểm tra khoảng bảo vệ theo bản vẽ kết cấu.', 'CHECKED', 'admin1', 'admin1'),
  (111, 3, 3, '2026-03-11', 'Nắng ráo, nhiệt độ 31°C', 45, 'San lấp và lu lèn nền đường nội khu đoạn D2, hoàn thành 180 mét.', 'APPROVED', 'admin1', 'admin1'),
  (112, 4, 101, '2026-03-12', 'Mưa nhỏ buổi sáng', 18, 'Thi công tường gạch khu vực sảnh chính tầng 1, kiểm tra tim trục và cao độ.', 'PENDING', 'admin1', 'admin1'),
  (113, 5, 102, '2026-03-13', 'Trời trong, nhiệt độ 27°C', 36, 'Lắp đặt hệ thống ống gió tầng 3 và gia cố giá treo theo hồ sơ MEP.', 'APPROVED', 'admin1', 'admin1'),
  (114, 6, 103, '2026-03-14', 'Nhiều mây, nhiệt độ 25°C', 24, 'Kiểm tra cao độ móng máy và hoàn thiện lớp bê tông lót khu vực sản xuất.', 'REJECTED', 'admin1', 'admin1'),
  (115, 1, 104, '2026-03-15', 'Nắng đẹp, nhiệt độ 28°C', 41, 'Thi công cốt thép vách lõi thang máy từ tầng 3 đến tầng 4.', 'APPROVED', 'admin1', 'admin1'),
  (116, 2, 105, '2026-03-16', 'Nắng nhẹ, gió mát', 30, 'Lắp dựng cốp pha dầm biên tầng 7 và kiểm tra độ võng trước nghiệm thu.', 'DRAFT', 'admin1', 'admin1'),
  (117, 3, 106, '2026-03-17', 'Mưa rào buổi chiều', 52, 'Thi công hệ thống thoát nước mưa tuyến N3, hoàn trả mặt bằng sau khi lấp đất.', 'CHECKED', 'admin1', 'admin1'),
  (118, 4, 107, '2026-03-18', 'Trời âm u, nhiệt độ 24°C', 20, 'Lắp đặt khung cửa nhôm kính khu điều trị tầng 2 và xử lý mối nối chống thấm.', 'APPROVED', 'admin1', 'admin1'),
  (119, 5, 108, '2026-03-19', 'Nắng nóng, nhiệt độ 33°C', 38, 'Đổ bê tông móng thiết bị khu kỹ thuật, bố trí bạt che và tưới bảo dưỡng.', 'PENDING', 'admin1', 'admin1'),
  (120, 6, 109, '2026-03-20', 'Nắng ráo, nhiệt độ 30°C', 27, 'Lắp đặt máng cáp chính trong nhà xưởng và đánh dấu tuyến theo bản vẽ thi công.', 'APPROVED', 'admin1', 'admin1'),
  (121, 1, 1, '2026-03-21', 'Nhiều mây, gió nhẹ', 34, 'Thi công xây tường bao tầng 3 khu B, kiểm tra mạch vữa và liên kết cột.', 'APPROVED', 'admin1', 'admin1'),
  (122, 2, 2, '2026-03-22', 'Trời trong, nhiệt độ 26°C', 46, 'Lắp dựng giàn giáo mặt ngoài trục 11-20 và bổ sung lưới an toàn.', 'CHECKED', 'admin1', 'admin1'),
  (123, 3, 3, '2026-03-23', 'Nắng nhẹ, nhiệt độ 29°C', 39, 'Thi công lớp cấp phối đá dăm đường nội bộ khu C, kiểm tra độ chặt hiện trường.', 'PENDING', 'admin1', 'admin1'),
  (124, 4, 101, '2026-03-24', 'Mưa rào buổi sáng', 16, 'Lắp đặt ống cấp nước chữa cháy tầng hầm B2 và thử kín từng đoạn tuyến.', 'APPROVED', 'admin1', 'admin1'),
  (125, 5, 102, '2026-03-25', 'Có mây, nhiệt độ 28°C', 31, 'Thi công trần thạch cao hành lang tầng 4, hoàn thiện khung xương và ty treo.', 'APPROVED', 'admin1', 'admin1'),
  (126, 6, 103, '2026-03-26', 'Nắng đẹp, gió nhẹ', 22, 'Kiểm tra bu lông neo chân cột khu kho thành phẩm trước khi lắp dựng kết cấu thép.', 'REJECTED', 'admin1', 'admin1'),
  (127, 1, 104, '2026-03-27', 'Nắng ráo, nhiệt độ 31°C', 43, 'Thi công lớp chống thấm sàn vệ sinh tầng 6 và thử nước trong 24 giờ.', 'APPROVED', 'admin1', 'admin1'),
  (128, 2, 105, '2026-03-28', 'Nhiều mây, se lạnh', 29, 'Lắp đặt ống đồng điều hòa khu văn phòng tầng 8, kiểm tra độ dốc đường ống.', 'DRAFT', 'admin1', 'admin1'),
  (129, 3, 106, '2026-03-29', 'Trời trong, nhiệt độ 27°C', 48, 'Đổ bê tông bó vỉa tuyến đường D1 và hoàn thiện cao độ mặt đường.', 'CHECKED', 'admin1', 'admin1'),
  (130, 4, 107, '2026-03-30', 'Nắng nhẹ, nhiệt độ 28°C', 19, 'Lắp đặt vách ngăn phòng bệnh tầng 5, kiểm tra kích thước ô cửa kỹ thuật.', 'APPROVED', 'admin1', 'admin1'),
  (131, 5, 108, '2026-03-31', 'Mưa nhỏ, nhiệt độ 25°C', 35, 'Thi công sơn lót khu vực sảnh thương mại, đo độ ẩm bề mặt trước khi sơn.', 'PENDING', 'admin1', 'admin1'),
  (132, 6, 109, '2026-04-01', 'Nắng ráo, nhiệt độ 30°C', 26, 'Lắp đặt tấm tôn bao che phía Đông nhà xưởng và hoàn thiện diềm mái.', 'APPROVED', 'admin1', 'admin1'),
  (133, 1, 1, '2026-04-02', 'Nắng nóng, nhiệt độ 32°C', 37, 'Thi công lan can thép cầu thang bộ tầng 2, kiểm tra mối hàn và lớp sơn bảo vệ.', 'APPROVED', 'admin1', 'admin1'),
  (134, 2, 2, '2026-04-03', 'Có mây, gió nhẹ', 44, 'Lắp đặt cửa chống cháy tầng 1 và kiểm tra khe hở quanh khung cửa.', 'CHECKED', 'admin1', 'admin1'),
  (135, 3, 3, '2026-04-04', 'Mưa rào buổi chiều', 50, 'Thi công hố ga thoát nước khu đô thị, hoàn thiện lớp vữa chống thấm thành hố.', 'REJECTED', 'admin1', 'admin1'),
  (136, 4, 101, '2026-04-05', 'Trời trong, nhiệt độ 26°C', 21, 'Lắp đặt thiết bị vệ sinh mẫu tại khu phòng bệnh tầng 3, kiểm tra cấp thoát nước.', 'APPROVED', 'admin1', 'admin1'),
  (137, 5, 102, '2026-04-06', 'Nắng đẹp, nhiệt độ 29°C', 33, 'Thi công lát đá khu vực sảnh chính, căn chỉnh mạch và bảo vệ bề mặt sau thi công.', 'PENDING', 'admin1', 'admin1'),
  (138, 6, 103, '2026-04-07', 'Nhiều mây, nhiệt độ 24°C', 25, 'Sơn chống cháy kết cấu thép nhà kho, đo chiều dày từng lớp sơn.', 'APPROVED', 'admin1', 'admin1'),
  (139, 1, 104, '2026-04-08', 'Nắng ráo, nhiệt độ 30°C', 40, 'Lắp đặt kính mặt dựng trục 1-5, kiểm tra gioăng và keo liên kết.', 'APPROVED', 'admin1', 'admin1'),
  (140, 2, 105, '2026-04-09', 'Mưa nhỏ buổi sáng', 23, 'Thi công đường ống sprinkler tầng hầm B1 và kiểm tra vị trí đầu phun.', 'CHECKED', 'admin1', 'admin1'),
  (141, 3, 106, '2026-04-10', 'Nắng nhẹ, nhiệt độ 28°C', 47, 'Lu lèn lớp nền sân thể thao khu đô thị và kiểm tra độ chặt theo từng lớp.', 'DRAFT', 'admin1', 'admin1'),
  (142, 4, 107, '2026-04-11', 'Trời âm u, nhiệt độ 25°C', 17, 'Hoàn thiện bả matit phòng kỹ thuật tầng 6, xử lý các vị trí nứt chân tường.', 'APPROVED', 'admin1', 'admin1'),
  (143, 5, 108, '2026-04-12', 'Nắng nóng, nhiệt độ 34°C', 42, 'Lắp đặt hệ thống chiếu sáng khu mua sắm tầng 2 và kiểm tra tủ điện phân phối.', 'PENDING', 'admin1', 'admin1'),
  (144, 6, 109, '2026-04-13', 'Nắng ráo, nhiệt độ 31°C', 28, 'Thi công nền bê tông khu vực bốc dỡ hàng, tạo khe co giãn theo thiết kế.', 'APPROVED', 'admin1', 'admin1'),
  (145, 1, 1, '2026-04-14', 'Có mây, gió nhẹ', 36, 'Nghiệm thu hoàn thiện chống thấm mái khu A trước khi chuyển sang lớp bảo vệ.', 'APPROVED', 'admin1', 'admin1'),
  (146, 2, 2, '2026-04-15', 'Trời trong, nhiệt độ 27°C', 49, 'Lắp đặt hệ thống cấp gió tươi tầng 9, cân chỉnh miệng gió và kiểm tra lưu lượng.', 'CHECKED', 'admin1', 'admin1'),
  (147, 3, 3, '2026-04-16', 'Mưa rào buổi chiều', 30, 'Thi công bó vỉa và lát gạch vỉa hè tuyến D4, vệ sinh mặt bằng cuối ca.', 'PENDING', 'admin1', 'admin1'),
  (148, 4, 101, '2026-04-17', 'Nắng đẹp, nhiệt độ 29°C', 18, 'Lắp đặt biển chỉ dẫn và hoàn thiện khu vực sảnh cấp cứu, kiểm tra độ chắc chắn.', 'APPROVED', 'admin1', 'admin1');
