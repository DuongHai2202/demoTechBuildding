-- =========================================================
-- V33: REVI STRUCTURAL FILE MANAGEMENT
-- Create table for BIM models (Revit files)
-- =========================================================

CREATE TABLE `tbl_bim_models` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `zone_id` INT,
    `model_name` VARCHAR(255) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `version` VARCHAR(50),
    `description` TEXT,
    `file_size` BIGINT,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`zone_id`) REFERENCES `tbl_zones`(`id`) ON DELETE SET NULL
);
