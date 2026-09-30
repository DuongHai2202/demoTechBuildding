-- Normalize legacy accounts to the current invariant: one account has one
-- global role. Existing data created before the single-role validation could
-- contain combinations such as GUEST + STAFF. Keep the highest existing role
-- so this migration never silently reduces a user's effective access.

CREATE TEMPORARY TABLE `tmp_primary_user_roles` (
  `user_id` BIGINT NOT NULL PRIMARY KEY,
  `role_id` BIGINT NOT NULL
);

INSERT INTO `tmp_primary_user_roles` (`user_id`, `role_id`)
SELECT `user_id`, `role_id`
FROM (
  SELECT
    uhr.`user_id`,
    uhr.`role_id`,
    ROW_NUMBER() OVER (
      PARTITION BY uhr.`user_id`
      ORDER BY CASE r.`name`
        WHEN 'ADMIN' THEN 1
        WHEN 'PM' THEN 2
        WHEN 'STAFF' THEN 3
        WHEN 'PARTNER' THEN 4
        WHEN 'GUEST' THEN 5
        ELSE 99
      END, r.`name`, uhr.`role_id`
    ) AS `role_rank`
  FROM `tbl_user_has_roles` uhr
  JOIN `tbl_roles` r ON r.`id` = uhr.`role_id`
) ranked
WHERE `role_rank` = 1;

DELETE FROM `tbl_user_has_roles`;

INSERT INTO `tbl_user_has_roles` (`user_id`, `role_id`)
SELECT `user_id`, `role_id`
FROM `tmp_primary_user_roles`;

DROP TEMPORARY TABLE `tmp_primary_user_roles`;
