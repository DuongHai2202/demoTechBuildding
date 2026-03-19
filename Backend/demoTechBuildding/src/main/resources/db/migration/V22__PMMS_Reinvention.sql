-- V22: PMMS - Centralized Material Library Reinvention

-- 1. Drop old foreign keys and tables
ALTER TABLE `tbl_materials` DROP FOREIGN KEY `fk_material_layer`;
DROP TABLE IF EXISTS `tbl_material_layers`;
DROP TABLE IF EXISTS `tbl_material_sub_systems`;

-- 2. Create New Categories Table
CREATE TABLE `tbl_material_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Material Categories
INSERT INTO `tbl_material_categories` (`name`, `description`) VALUES 
('Nhân công', 'Nhân công thi công xây dựng'),
('Vật liệu xây dựng', 'Vật liệu cơ bản: Cát, đá, xi măng, gạch...'),
('Hệ thống HVAC', 'Hệ thống điều hòa không khí và thông gió'),
('Hệ thống Điện - Điện nhẹ', 'Cáp điện, thiết bị chiếu sáng, hệ thống camera...'),
('Cấp thoát nước (CTN)', 'Ống nước và phụ kiện liên quan'),
('Vật tư phụ', 'Bulong, ốc vít, keo xịt...'),
('Thiết bị bảo hộ', 'Mũ, áo, giày bảo hộ...');

-- 3. Alter tbl_materials
ALTER TABLE `tbl_materials` DROP COLUMN `layer_id`;
ALTER TABLE `tbl_materials` DROP COLUMN `description`;

-- Rename existing 'name' and 'code' to match new structure
ALTER TABLE `tbl_materials` CHANGE COLUMN `name` `name_vi` VARCHAR(255) NOT NULL;
ALTER TABLE `tbl_materials` CHANGE COLUMN `code` `management_code` VARCHAR(50) NULL;

-- Add new columns for Multi-language, Image, and Category
ALTER TABLE `tbl_materials` 
ADD COLUMN `category_id` INT NULL,
ADD COLUMN `name_en` VARCHAR(255) NULL,
ADD COLUMN `name_zh` VARCHAR(255) NULL,
ADD COLUMN `description_vi` TEXT NULL,
ADD COLUMN `description_en` TEXT NULL,
ADD COLUMN `description_zh` TEXT NULL,
ADD CONSTRAINT `fk_material_category` FOREIGN KEY (`category_id`) REFERENCES `tbl_material_categories`(`id`) ON DELETE SET NULL;
