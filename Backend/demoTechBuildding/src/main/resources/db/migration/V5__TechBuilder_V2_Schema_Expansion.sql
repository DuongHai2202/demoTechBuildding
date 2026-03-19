-- =========================================================
-- V5: TECHBUILDER V2 - MỞ RỘNG SCHEMA
-- Bổ sung: Partners, Zones, ProjectSlides, Drawings
-- Cập nhật: Projects, Contracts, BoqItems
-- =========================================================

-- -----------------------------------------------------------
-- 1. BẢNG MỚI: tbl_partners (Quản lý Đối tác / Chủ đầu tư)
-- -----------------------------------------------------------
CREATE TABLE `tbl_partners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `partner_code` VARCHAR(50) UNIQUE,
  `tax_code` VARCHAR(50),
  `status` VARCHAR(50),
  `type` VARCHAR(50) COMMENT 'Loại: Chu dau tu, Nha thau phu, Nha cung cap',
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------
-- 2. BẢNG MỚI: tbl_zones (Khu vực trong Dự án)
-- -----------------------------------------------------------
CREATE TABLE `tbl_zones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `zone_code` VARCHAR(50),
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- 3. BẢNG MỚI: tbl_project_slides (Thư viện ảnh Dự án)
-- -----------------------------------------------------------
CREATE TABLE `tbl_project_slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `caption` VARCHAR(255),
  `display_order` INT,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- 4. BẢNG MỚI: tbl_drawings (Quản lý Bản vẽ kỹ thuật)
-- -----------------------------------------------------------
CREATE TABLE `tbl_drawings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `contract_id` INT,
  `name` VARCHAR(255) NOT NULL,
  `drawing_number` VARCHAR(100),
  `file_url` VARCHAR(500),
  `version` VARCHAR(20),
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`contract_id`) REFERENCES `tbl_contracts`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------
-- 5. CẬP NHẬT: tbl_projects - Thêm mã dự án
-- -----------------------------------------------------------
ALTER TABLE `tbl_projects`
  ADD COLUMN `project_code` VARCHAR(50) UNIQUE AFTER `name`;

-- -----------------------------------------------------------
-- 6. CẬP NHẬT: tbl_contracts - Thêm workflow & partner FK
-- -----------------------------------------------------------
ALTER TABLE `tbl_contracts`
  ADD COLUMN `partner_id` INT AFTER `partner_name`,
  ADD COLUMN `workflow_step` INT DEFAULT 1 AFTER `status`,
  ADD COLUMN `guarantee_info` TEXT AFTER `workflow_step`,
  ADD CONSTRAINT `fk_contract_partner` FOREIGN KEY (`partner_id`) REFERENCES `tbl_partners`(`id`) ON DELETE SET NULL;

-- -----------------------------------------------------------
-- 7. CẬP NHẬT: tbl_boq_items - Thêm VAT & phân cấp
-- -----------------------------------------------------------
ALTER TABLE `tbl_boq_items`
  ADD COLUMN `vat_rate` DECIMAL(5,2) AFTER `total_price`,
  ADD COLUMN `vat_amount` DECIMAL(18,2) AFTER `vat_rate`,
  ADD COLUMN `total_with_vat` DECIMAL(18,2) AFTER `vat_amount`,
  ADD COLUMN `parent_id` INT AFTER `total_with_vat`,
  ADD CONSTRAINT `fk_boq_parent` FOREIGN KEY (`parent_id`) REFERENCES `tbl_boq_items`(`id`) ON DELETE SET NULL;
