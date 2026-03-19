-- Support hierarchical zones (Area -> Floor -> Unit)
ALTER TABLE `tbl_zones` 
ADD COLUMN `parent_id` INT DEFAULT NULL AFTER `project_id`,
ADD CONSTRAINT `fk_zone_parent` FOREIGN KEY (`parent_id`) REFERENCES `tbl_zones`(`id`) ON DELETE SET NULL;

-- Create Master Plan table (Project Schedule)
CREATE TABLE `tbl_master_plan` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `start_date` DATE,
  `end_date` DATE,
  `progress` INT DEFAULT 0, -- 0-100%
  `status` VARCHAR(20) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED
  `parent_id` BIGINT DEFAULT NULL, -- Support hierarchical tasks
  `display_order` INT DEFAULT 0,
  `created_by` VARCHAR(50),
  `updated_by` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `tbl_master_plan`(`id`) ON DELETE CASCADE
);
