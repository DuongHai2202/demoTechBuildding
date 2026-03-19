-- V20: PMMS - Centralized Material Library Reinvention

-- 1. Create Sub-systems table
CREATE TABLE `tbl_material_sub_systems` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(50) NOT NULL, -- LABOR, BUILDING, HVAC, ELECTRICAL, PLUMBING, SUPPORT, PPE
    `description` TEXT,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create Layers table
CREATE TABLE `tbl_material_layers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sub_system_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `description` TEXT,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`sub_system_id`) REFERENCES `tbl_material_sub_systems`(`id`) ON DELETE CASCADE
);

-- 3. Update Materials table
ALTER TABLE `tbl_materials` 
ADD COLUMN `layer_id` INT NULL,
ADD COLUMN `code` VARCHAR(50) NULL,
ADD COLUMN `catalogue_url` VARCHAR(500) NULL,
ADD COLUMN `revit_family_category` VARCHAR(100) NULL,
ADD COLUMN `revit_code` VARCHAR(100) NULL,
ADD CONSTRAINT `fk_material_layer` FOREIGN KEY (`layer_id`) REFERENCES `tbl_material_layers`(`id`) ON DELETE SET NULL;

-- 4. Initial Seed for Sub-systems
INSERT INTO `tbl_material_sub_systems` (`name`, `type`, `description`) VALUES 
('Nhân công thi công xây dựng', 'LABOR', 'Bao gồm các tổ đội công nhân và thợ kỹ thuật'),
('Vật liệu xây dựng', 'BUILDING', 'Vật liệu cơ bản: Cát, đá, xi măng, gạch...'),
('Hệ thống HVAC', 'HVAC', 'Hệ thống điều hòa không khí và thông gió'),
('Hệ thống Điện - Điện nhẹ', 'ELECTRICAL', 'Cáp điện, thiết bị chiếu sáng, hệ thống camera...'),
('Hệ thống Cấp thoát nước', 'PLUMBING', 'Ống nước và phụ kiện liên quan'),
('Vật tư phụ', 'SUPPORT', 'Bulong, ốc vít, keo xịt...'),
('Thiết bị bảo hộ', 'PPE', 'Mũ, áo, giày bảo hộ...');
