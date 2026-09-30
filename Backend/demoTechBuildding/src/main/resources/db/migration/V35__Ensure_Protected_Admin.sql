-- Keep one canonical full-access administrator account available in every environment.
-- The application service layer also blocks all mutations for this username.

INSERT INTO `tbl_users`
  (`username`, `password`, `full_name`, `email`, `status`, `is_deleted`)
VALUES
  ('admin', '$2a$10$8.N77SPlAnYv.7N9X0W.VuE90/YhGvO.WJ/G/G.6/G.6/G.6/G.6',
   'System Administrator', 'admin@techbuild.com', 'ACTIVE', FALSE)
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `full_name` = VALUES(`full_name`),
  `email` = VALUES(`email`),
  `status` = 'ACTIVE',
  `is_deleted` = FALSE;

INSERT IGNORE INTO `tbl_user_has_roles` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `tbl_users` u
JOIN `tbl_roles` r ON r.name = 'ADMIN'
WHERE u.username = 'admin';
