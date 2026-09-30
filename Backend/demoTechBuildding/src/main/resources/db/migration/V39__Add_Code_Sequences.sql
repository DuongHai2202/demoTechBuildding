-- Central sequence store for human-readable business codes.
-- Codes remain editable; this table only provides collision-safe defaults.
CREATE TABLE IF NOT EXISTS `tbl_code_sequences` (
  `sequence_key` VARCHAR(100) PRIMARY KEY,
  `next_value` BIGINT NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
