-- =========================================================
-- V12: PHASE 9 - QUẢN LÝ ĐỐI TÁC & QUYỀN TRUY CẬP
-- Mở rộng thông tin đối tác và liên kết người dùng
-- =========================================================

-- 1. Cập nhật bảng tbl_partners: Bổ sung thông tin chi tiết
ALTER TABLE `tbl_partners`
  ADD COLUMN `address` VARCHAR(500) AFTER `tax_code`,
  ADD COLUMN `contact_person` VARCHAR(100) AFTER `address`,
  ADD COLUMN `phone` VARCHAR(20) AFTER `contact_person`,
  ADD COLUMN `email` VARCHAR(100) AFTER `phone`,
  ADD COLUMN `capacity_profile` TEXT AFTER `email`,
  ADD COLUMN `unit_prices_json` JSON AFTER `capacity_profile`;

-- 2. Cập nhật bảng tbl_users: Liên kết với đối tác
ALTER TABLE `tbl_users`
  ADD COLUMN `partner_id` INT AFTER `avatar_url`,
  ADD CONSTRAINT `fk_user_partner` FOREIGN KEY (`partner_id`) REFERENCES `tbl_partners`(`id`) ON DELETE SET NULL;
