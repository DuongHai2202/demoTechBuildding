-- Normalize legacy rows so reports never have an ambiguous NULL overtime
-- value. Historical non-eligible/unscheduled rows cannot be reviewed because
-- there is no valid scheduled end to compare against.
UPDATE `tbl_attendance_logs`
SET `overtime_minutes` = 0
WHERE `overtime_minutes` IS NULL;

UPDATE `tbl_attendance_logs`
SET `overtime_status` = 'NONE',
    `overtime_approved_minutes` = 0
WHERE COALESCE(`overtime_minutes`, 0) = 0;

UPDATE `tbl_attendance_logs` a
LEFT JOIN `tbl_shift_assignments` sa ON sa.`id` = a.`shift_assignment_id`
LEFT JOIN `tbl_shift_templates` st ON st.`id` = sa.`shift_template_id`
SET a.`overtime_minutes` = 0,
    a.`overtime_status` = 'NONE',
    a.`overtime_approved_minutes` = 0,
    a.`overtime_reviewed_by` = NULL,
    a.`overtime_reviewed_at` = NULL,
    a.`overtime_review_note` = NULL
WHERE a.`overtime_status` = 'PENDING'
  AND (st.`id` IS NULL OR st.`overtime_eligible` = FALSE);
