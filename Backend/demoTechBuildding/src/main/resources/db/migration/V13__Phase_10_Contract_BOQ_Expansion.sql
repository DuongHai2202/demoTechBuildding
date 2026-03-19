-- Phase 10: Contract & BOQ Management Extension

-- 1. Alter tbl_contracts for Addendums and Tracking
ALTER TABLE `tbl_contracts` 
ADD COLUMN `type` VARCHAR(20) DEFAULT 'MAIN',
ADD COLUMN `parent_id` INT NULL,
ADD COLUMN `signed_date` DATE,
ADD COLUMN `start_date` DATE,
ADD COLUMN `end_date` DATE,
ADD CONSTRAINT `fk_contracts_parent` FOREIGN KEY (`parent_id`) REFERENCES `tbl_contracts`(`id`);

-- 2. Alter tbl_boq_items for BIM integration
ALTER TABLE `tbl_boq_items` 
ADD COLUMN `bim_id` VARCHAR(100) NULL;

-- 3. Create tbl_contract_material_limits (Hạn mức vật tư theo hợp đồng)
CREATE TABLE `tbl_contract_material_limits` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `contract_id` INT NOT NULL,
    `material_id` INT NOT NULL,
    `limit_quantity` FLOAT NOT NULL,
    `notes` TEXT,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`contract_id`) REFERENCES `tbl_contracts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`material_id`) REFERENCES `tbl_materials`(`id`) ON DELETE CASCADE
);
