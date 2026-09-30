-- V35 guarantees that the canonical account exists. Keep its documented
-- local password stable so the demo administrator can always sign in.

UPDATE `tbl_users`
SET
  `password` = '$2a$10$HKDaczug/5/rgt5HCqf17OSJ9E6LXS.u0OOPapluMqPOg4cuOjE7S',
  `full_name` = 'System Administrator',
  `email` = 'admin@techbuild.com',
  `status` = 'ACTIVE',
  `is_deleted` = FALSE
WHERE `username` = 'admin';
