-- Add missing audit columns to tbl_notifications
ALTER TABLE `tbl_notifications` 
ADD COLUMN `created_by` VARCHAR(50) AFTER `target_url`,
ADD COLUMN `updated_by` VARCHAR(50) AFTER `created_by`;
