-- =========================================================
-- MIGRATION V2: DROP UNUSED TABLES (REDIS MIGRATION)
-- =========================================================

-- We migrated refresh tokens and OTP generation to Redis.
-- The database tables `tbl_refresh_tokens` and `tbl_otp_codes` are no longer needed.

DROP TABLE IF EXISTS `tbl_refresh_tokens`;
DROP TABLE IF EXISTS `tbl_otp_codes`;
