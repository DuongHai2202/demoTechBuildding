-- =========================================================
-- V14: PHASE 11 & 12 SCHEMA EXPANSION
-- Design, BIM, and Tendering Modules
-- =========================================================

-- --- 1. Phase 11: Design & BIM Management ---

CREATE TABLE `tbl_design_sheets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `zone_id` INT,
    `sheet_number` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `discipline` VARCHAR(50),
    `revision` VARCHAR(20),
    `status` VARCHAR(50),
    `file_url` VARCHAR(500),
    `thumbnail_url` VARCHAR(500),
    `issued_at` DATE,
    `issued_by` BIGINT,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`zone_id`) REFERENCES `tbl_zones`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`issued_by`) REFERENCES `tbl_users`(`id`) ON DELETE SET NULL
);

CREATE TABLE `tbl_rfis` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `question` TEXT NOT NULL,
    `suggested_solution` TEXT,
    `status` VARCHAR(50),
    `assigned_to` BIGINT,
    `resolved_at` TIMESTAMP,
    `design_sheet_id` INT,
    `coord_x` DOUBLE,
    `coord_y` DOUBLE,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assigned_to`) REFERENCES `tbl_users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`design_sheet_id`) REFERENCES `tbl_design_sheets`(`id`) ON DELETE SET NULL
);

CREATE TABLE `tbl_rfi_comments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `rfi_id` INT NOT NULL,
    `content` TEXT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`rfi_id`) REFERENCES `tbl_rfis`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `tbl_users`(`id`) ON DELETE CASCADE
);

-- --- 2. Phase 12: Tendering & Contractor Selection ---

CREATE TABLE `tbl_bidding_packages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `package_code` VARCHAR(50) NOT NULL UNIQUE,
    `package_name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `budget` DECIMAL(19, 2),
    `status` VARCHAR(30) NOT NULL,
    `deadline` TIMESTAMP,
    `criteria` TEXT,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `tbl_projects`(`id`) ON DELETE CASCADE
);

CREATE TABLE `tbl_bid_submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `package_id` INT NOT NULL,
    `partner_id` INT NOT NULL,
    `bid_price` DECIMAL(19, 2) NOT NULL,
    `proposal_file_url` VARCHAR(500),
    `status` VARCHAR(20) NOT NULL,
    `notes` TEXT,
    `created_by` VARCHAR(50),
    `updated_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`package_id`) REFERENCES `tbl_bidding_packages`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`partner_id`) REFERENCES `tbl_partners`(`id`) ON DELETE CASCADE
);
