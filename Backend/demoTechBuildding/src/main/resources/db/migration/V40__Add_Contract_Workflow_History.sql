-- Contract workflow audit trail.
-- workflow_step remains the current snapshot; this table keeps the immutable history.
CREATE TABLE IF NOT EXISTS `tbl_contract_workflow_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `contract_id` INT NOT NULL,
    `from_step` INT NULL,
    `to_step` INT NOT NULL,
    `action` VARCHAR(30) NOT NULL,
    `note` TEXT,
    `changed_by` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_contract_workflow_history_contract`
        FOREIGN KEY (`contract_id`) REFERENCES `tbl_contracts`(`id`) ON DELETE CASCADE,
    INDEX `idx_contract_workflow_history_contract_created`
        (`contract_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Existing contracts start with a traceable baseline instead of an empty timeline.
INSERT INTO `tbl_contract_workflow_history`
    (`contract_id`, `from_step`, `to_step`, `action`, `note`, `changed_by`)
SELECT c.`id`, NULL, COALESCE(c.`workflow_step`, 1), 'INITIAL',
       'Khởi tạo lịch sử từ dữ liệu hợp đồng hiện có.', 'SYSTEM'
FROM `tbl_contracts` c
WHERE NOT EXISTS (
    SELECT 1
    FROM `tbl_contract_workflow_history` h
    WHERE h.`contract_id` = c.`id`
);
