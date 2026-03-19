-- Phase 13: Material & Norm Management Expansion

-- 1. Update tbl_materials for Revit Sync
ALTER TABLE `tbl_materials` 
ADD COLUMN `revit_id` VARCHAR(100) NULL,
ADD COLUMN `properties` JSON NULL;

-- 2. Update tbl_material_requests for Approval Workflow
ALTER TABLE `tbl_material_requests`
ADD COLUMN `checked_by` BIGINT NULL,
ADD COLUMN `approved_by` BIGINT NULL,
ADD COLUMN `checked_at` TIMESTAMP NULL,
ADD COLUMN `approved_at` TIMESTAMP NULL,
ADD COLUMN `notes` TEXT NULL,
ADD CONSTRAINT `fk_mr_checked_by` FOREIGN KEY (`checked_by`) REFERENCES `tbl_users`(`id`) ON DELETE SET NULL,
ADD CONSTRAINT `fk_mr_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `tbl_users`(`id`) ON DELETE SET NULL;

-- 3. Create tbl_material_norms (Định mức vật tư)
CREATE TABLE `tbl_material_norms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `boq_item_id` INT NOT NULL,
    `material_id` INT NOT NULL,
    `quantity_per_unit` FLOAT NOT NULL,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`boq_item_id`) REFERENCES `tbl_boq_items`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`material_id`) REFERENCES `tbl_materials`(`id`) ON DELETE CASCADE
);
