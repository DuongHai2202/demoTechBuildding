ALTER TABLE `tbl_users`
ADD COLUMN `face_descriptor` TEXT COMMENT 'Stores face-api.js 128-d descriptor array as a JSON string';
