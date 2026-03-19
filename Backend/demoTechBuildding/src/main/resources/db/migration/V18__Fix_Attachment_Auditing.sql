-- Add missing audit columns to tbl_contract_attachments
ALTER TABLE tbl_contract_attachments
ADD COLUMN created_by VARCHAR(255) AFTER is_deleted,
ADD COLUMN updated_by VARCHAR(255) AFTER created_by;
