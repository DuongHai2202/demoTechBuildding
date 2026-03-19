-- Phase 15: Technical Standards
CREATE TABLE tbl_technical_standards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- CONCRETE, FINISHING, MEP, etc.
    file_url TEXT,
    version VARCHAR(20),
    project_id INT, -- NULL means Global Standard
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_std_project FOREIGN KEY (project_id) REFERENCES tbl_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
