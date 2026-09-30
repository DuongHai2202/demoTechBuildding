-- Administrative overtime policy:
--  * Night shifts never create overtime.
--  * A single morning/afternoon session never creates overtime.
--  * Overtime is considered only after a complete administrative day:
--      08:00-12:00 + 13:00-17:30, or a legacy 08:00-17:30 assignment.
--  * The payable request is bounded to 60..210 minutes.

UPDATE `tbl_shift_templates`
SET `overtime_eligible` = FALSE
WHERE `code` IN ('CA-SANG', 'CA-DEM');

UPDATE `tbl_shift_templates`
SET `overtime_eligible` = TRUE
WHERE `code` IN ('CA-CHIEU', 'CA-HC');

-- Re-evaluate old pending requests. A pending request is retained only when
-- the stored attendance evidence proves a complete administrative day. This
-- prevents old night/half-day calculations from entering the approval queue.
CREATE TEMPORARY TABLE `tmp_valid_admin_overtime` (
  `attendance_id` BIGINT PRIMARY KEY
);

INSERT INTO `tmp_valid_admin_overtime` (`attendance_id`)
SELECT a.`id`
FROM `tbl_attendance_logs` a
JOIN `tbl_shift_assignments` sa ON sa.`id` = a.`shift_assignment_id`
JOIN `tbl_shift_templates` st ON st.`id` = sa.`shift_template_id`
WHERE a.`status` = 'COMPLETED'
  AND a.`check_in_at` IS NOT NULL
  AND a.`check_out_at` IS NOT NULL
  AND a.`check_in_at` <= TIMESTAMP(sa.`work_date`, st.`start_time`)
  AND a.`check_out_at` >= TIMESTAMP(sa.`work_date`, st.`end_time`)
  AND st.`crosses_midnight` = FALSE
  AND (
    (st.`start_time` = '08:00:00' AND st.`end_time` = '17:30:00')
    OR (
      st.`start_time` = '13:00:00'
      AND st.`end_time` = '17:30:00'
      AND EXISTS (
        SELECT 1
        FROM `tbl_attendance_logs` m
        JOIN `tbl_shift_assignments` msa ON msa.`id` = m.`shift_assignment_id`
        JOIN `tbl_shift_templates` mst ON mst.`id` = msa.`shift_template_id`
        WHERE m.`user_id` = a.`user_id`
          AND m.`project_id` = a.`project_id`
          AND msa.`work_date` = sa.`work_date`
          AND m.`status` = 'COMPLETED'
          AND m.`check_in_at` IS NOT NULL
          AND m.`check_out_at` IS NOT NULL
          AND mst.`crosses_midnight` = FALSE
          AND mst.`start_time` = '08:00:00'
          AND mst.`end_time` = '12:00:00'
          AND m.`check_in_at` <= TIMESTAMP(msa.`work_date`, mst.`start_time`)
          AND m.`check_out_at` >= TIMESTAMP(msa.`work_date`, mst.`end_time`)
      )
    )
  );

UPDATE `tbl_attendance_logs` a
JOIN `tmp_valid_admin_overtime` v ON v.`attendance_id` = a.`id`
SET a.`overtime_minutes` = LEAST(210, GREATEST(60,
      TIMESTAMPDIFF(MINUTE, a.`scheduled_end_at`, a.`check_out_at`))),
    a.`overtime_status` = 'PENDING',
    a.`overtime_approved_minutes` = 0,
    a.`overtime_reviewed_by` = NULL,
    a.`overtime_reviewed_at` = NULL,
    a.`overtime_review_note` = NULL
WHERE a.`overtime_status` = 'PENDING'
  AND a.`scheduled_end_at` IS NOT NULL
  AND a.`check_out_at` > a.`scheduled_end_at`;

UPDATE `tbl_attendance_logs` a
LEFT JOIN `tmp_valid_admin_overtime` v ON v.`attendance_id` = a.`id`
SET a.`overtime_minutes` = 0,
    a.`overtime_status` = 'NONE',
    a.`overtime_approved_minutes` = 0,
    a.`overtime_reviewed_by` = NULL,
    a.`overtime_reviewed_at` = NULL,
    a.`overtime_review_note` = NULL
WHERE a.`overtime_status` = 'PENDING'
  AND v.`attendance_id` IS NULL;

DROP TEMPORARY TABLE `tmp_valid_admin_overtime`;
