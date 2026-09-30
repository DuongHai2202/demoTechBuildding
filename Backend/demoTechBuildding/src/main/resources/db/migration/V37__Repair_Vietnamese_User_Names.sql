-- Repair demo user names that were imported with a non-Unicode connection.

UPDATE `tbl_users`
SET `full_name` = CASE `username`
  WHEN 'pm_an' THEN 'Kỹ sư trưởng Nguyễn Văn An'
  WHEN 'pm_tuan' THEN 'Chỉ huy phó Trần Minh Tuấn'
  WHEN 'staff_dat' THEN 'Cán bộ HSE Phạm Quốc Đạt'
  WHEN 'staff_nam' THEN 'Thủ kho vật tư Vũ Hải Nam'
  WHEN 'staff_ha' THEN 'Kế toán dự án Đặng Thu Hà'
  WHEN 'partner_duc' THEN 'Đại diện nhà thầu Hoàng Minh Đức'
  WHEN 'partner_mai' THEN 'Quản lý cung ứng Mai Phương Thảo'
END
WHERE `username` IN ('pm_an', 'pm_tuan', 'staff_dat', 'staff_nam', 'staff_ha', 'partner_duc', 'partner_mai');
