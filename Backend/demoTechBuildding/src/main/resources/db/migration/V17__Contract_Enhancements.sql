-- Update tbl_contract_material_limits with type classification
ALTER TABLE tbl_contract_material_limits
ADD COLUMN type VARCHAR(30) DEFAULT 'CONTRACTOR_SUPPLIED' AFTER limit_quantity;

-- Create table for contract attachments (Drawings already have their own or can use this)
CREATE TABLE tbl_contract_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_attachment_contract FOREIGN KEY (contract_id) REFERENCES tbl_contracts(id),
    CONSTRAINT fk_attachment_user FOREIGN KEY (uploaded_by) REFERENCES tbl_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
