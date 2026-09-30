-- Repair the additional demo rows that were imported with a non-UTF-8 client.
-- Keep this migration targeted to the known seed IDs so real user data is untouched.
SET NAMES utf8mb4;

UPDATE tbl_contracts
SET contract_name = CASE id
        WHEN 101 THEN 'Hợp đồng thi công kết cấu bê tông cốt thép thân hầm'
        WHEN 102 THEN 'Hợp đồng tổng thầu cơ điện MEP và PCCC'
        WHEN 103 THEN 'Hợp đồng cung ứng thép xây dựng CB400/CB500V'
        WHEN 104 THEN 'Hợp đồng cung cấp bê tông thương phẩm mác 350-450'
        WHEN 105 THEN 'Hợp đồng cung cấp & lắp dựng vách kính mặt dựng Unitized'
        WHEN 106 THEN 'Hợp đồng cung cấp thang máy tốc độ cao 3.5m/s'
    END,
    partner_name = CASE id
        WHEN 101 THEN 'Công ty CP Xây dựng Coteccons'
        WHEN 102 THEN 'Công ty TNHH Kỹ thuật Cơ điện REE'
        WHEN 103 THEN 'Tập đoàn Thép Hòa Phát'
        WHEN 104 THEN 'Công ty Bê tông Viwaseen'
        WHEN 105 THEN 'Công ty CP Nhôm Kính Eurowindow'
        WHEN 106 THEN 'Công ty Thang máy Mitsubishi Electric VN'
    END
WHERE id IN (101, 102, 103, 104, 105, 106)
  AND contract_number IN (
      'HD-2026/TB-CT01', 'HD-2026/TB-MEP02', 'HD-2026/TB-THEP03',
      'HD-2026/TB-BT04', 'HD-2026/TB-KINH05', 'HD-2026/TB-THANG06'
  );

UPDATE tbl_bidding_packages
SET package_name = CASE id
        WHEN 101 THEN 'Gói thầu thi công hoàn thiện nội thất sảnh và căn hộ mẫu'
        WHEN 102 THEN 'Gói thầu cung cấp & lắp đặt hệ thống máy phát điện dự phòng 2000kVA'
        WHEN 103 THEN 'Gói thầu thi công hạ tầng cảnh quan cây xanh và đài phun nước'
        WHEN 104 THEN 'Gói thầu hệ thống BMS điều khiển và quản lý tòa nhà thông minh'
        WHEN 105 THEN 'Gói thầu thi công sơn bả matit mặt ngoài chống thấm Nano cao cấp'
    END,
    description = CASE id
        WHEN 101 THEN 'Thi công lát sàn đá Granite, ốp tường, trần thạch cao và hệ thống chiếu sáng nghệ thuật'
        WHEN 102 THEN 'Cung cấp 02 tổ máy phát điện Cummins 2000kVA đồng bộ vỏ cách âm và bồn dầu ngầm'
        WHEN 103 THEN 'Quy hoạch đường dạo bộ, thảm cỏ Bermuda, cây bóng mát công trình và hệ thống tưới tự động'
        WHEN 104 THEN 'Tích hợp giám sát điều hòa Chiller, thông gió HVAC, PCCC, chiếu sáng và đo đếm điện năng thông minh'
        WHEN 105 THEN 'Sơn phủ ngoại thất Jotun Jotashield 3 lớp kháng kiềm, chống bám bụi và rêu mốc bảo hành 10 năm'
    END
WHERE id IN (101, 102, 103, 104, 105)
  AND package_code IN (
      'TB-BID-2026-01', 'TB-BID-2026-02', 'TB-BID-2026-03',
      'TB-BID-2026-04', 'TB-BID-2026-05'
  );

UPDATE tbl_attendance_logs
SET remarks = CASE id
        WHEN 101 THEN 'Face-ID Match 98.6% - Tại công trường Zone A'
        WHEN 102 THEN 'Face-ID Match 99.1% - Tại cổng bảo vệ số 1'
        WHEN 103 THEN 'QR Code Scan + GPS Geofence hợp lệ'
        WHEN 104 THEN 'Face-ID Match 97.4% - Đúng ca trực HSE'
        WHEN 105 THEN 'Face-ID Match 99.4% - Xuất nhập kho vật tư'
        WHEN 106 THEN 'Văn phòng Ban điều hành dự án'
    END
WHERE id IN (101, 102, 103, 104, 105, 106)
  AND user_id IN (101, 102, 103, 104, 105, 106);
