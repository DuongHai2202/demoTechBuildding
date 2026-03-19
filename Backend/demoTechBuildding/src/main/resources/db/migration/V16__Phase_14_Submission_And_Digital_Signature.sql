-- Phase 14: Submission Workflow & Digital Signature

-- Table for Digital Signatures
CREATE TABLE tbl_digital_signatures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    signer_id BIGINT NOT NULL,
    signature_type VARCHAR(20) NOT NULL, -- ELECTRONIC, SMART_CA
    signature_data LONGTEXT,
    certificate_serial VARCHAR(255),
    signed_at DATETIME NOT NULL,
    ip_address VARCHAR(45),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_sig_signer FOREIGN KEY (signer_id) REFERENCES tbl_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Submissions
CREATE TABLE tbl_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    submission_type VARCHAR(50) NOT NULL, -- MATERIAL_REQUEST, RFI, etc.
    reference_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    current_step_index INT DEFAULT 0,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_sub_project FOREIGN KEY (project_id) REFERENCES tbl_projects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for Submission Steps
CREATE TABLE tbl_submission_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_order INT NOT NULL,
    assigned_role VARCHAR(50),
    processor_id BIGINT,
    status VARCHAR(20) DEFAULT 'PENDING',
    comments TEXT,
    signature_id BIGINT,
    processed_at DATETIME,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_step_submission FOREIGN KEY (submission_id) REFERENCES tbl_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_step_processor FOREIGN KEY (processor_id) REFERENCES tbl_users(id),
    CONSTRAINT fk_step_signature FOREIGN KEY (signature_id) REFERENCES tbl_digital_signatures(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
