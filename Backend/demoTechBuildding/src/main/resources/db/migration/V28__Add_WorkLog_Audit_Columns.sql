-- Add audit columns to tbl_work_logs for checking and approval workflow
ALTER TABLE `tbl_work_logs` 
ADD COLUMN `checked_by` BIGINT NULL,
ADD COLUMN `approved_by` BIGINT NULL,
ADD COLUMN `checked_at` TIMESTAMP NULL,
ADD COLUMN `approved_at` TIMESTAMP NULL,
ADD COLUMN `notes` TEXT NULL;

-- Add foreign key constraints for audit columns
ALTER TABLE `tbl_work_logs`
ADD CONSTRAINT `fk_worklogs_checked_by` FOREIGN KEY (`checked_by`) REFERENCES `tbl_users`