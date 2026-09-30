-- Full ca hành chính is one continuous assignment, not a morning and an
-- afternoon assignment.  The break is a payroll/calculation detail only.
UPDATE `tbl_shift_templates`
SET
  `name` = 'Ca hành chính',
  `start_time` = '08:00:00',
  `end_time` = '17:30:00',
  `crosses_midnight` = FALSE,
  `break_minutes` = 90,
  `early_check_in_minutes` = 30,
  `late_check_in_minutes` = 30,
  `overtime_eligible` = TRUE,
  `status` = 'ACTIVE'
WHERE `code` = 'CA-HC';

-- Previous application versions represented a Full ca as two assignments.
-- Find only rows explicitly created by that flow; ordinary independently
-- assigned morning/afternoon shifts must not be changed.
CREATE TEMPORARY TABLE `tmp_legacy_full_day_pairs` AS
SELECT
  MIN(m.`id`) AS `morning_assignment_id`,
  MAX(a.`id`) AS `afternoon_assignment_id`,
  m.`project_id`,
  m.`user_id`,
  m.`work_date`,
  COALESCE(NULLIF(m.`created_by`, ''), NULLIF(a.`created_by`, ''), 'SYSTEM') AS `created_by`
FROM `tbl_shift_assignments` m
JOIN `tbl_shift_templates` mt ON mt.`id` = m.`shift_template_id`
JOIN `tbl_shift_assignments` a
  ON a.`project_id` = m.`project_id`
 AND a.`user_id` = m.`user_id`
 AND a.`work_date` = m.`work_date`
JOIN `tbl_shift_templates` at ON at.`id` = a.`shift_template_id`
WHERE mt.`code` = 'CA-SANG'
  AND at.`code` = 'CA-CHIEU'
  AND m.`notes` LIKE '%Full ca hành chính · buổi sáng%'
  AND a.`notes` LIKE '%Full ca hành chính · buổi chiều%'
  AND m.`status` <> 'CANCELLED'
  AND a.`status` <> 'CANCELLED'
GROUP BY m.`project_id`, m.`user_id`, m.`work_date`,
         COALESCE(NULLIF(m.`created_by`, ''), NULLIF(a.`created_by`, ''), 'SYSTEM');

-- Create one continuous assignment for every legacy pair unless it was
-- already repaired by a previous run/manual action.
INSERT IGNORE INTO `tbl_shift_assignments`
  (`shift_template_id`, `project_id`, `user_id`, `work_date`, `status`, `notes`, `created_by`, `updated_by`)
SELECT
  st.`id`,
  p.`project_id`,
  p.`user_id`,
  p.`work_date`,
  'ASSIGNED',
  'Full ca hành chính · 08:00–17:30 · 1 checkout · Đã gộp từ lịch cũ',
  p.`created_by`,
  'SYSTEM'
FROM `tmp_legacy_full_day_pairs` p
JOIN `tbl_shift_templates` st ON st.`code` = 'CA-HC'
WHERE NOT EXISTS (
  SELECT 1
  FROM `tbl_shift_assignments` existing
  WHERE existing.`project_id` = p.`project_id`
    AND existing.`user_id` = p.`user_id`
    AND existing.`work_date` = p.`work_date`
    AND existing.`shift_template_id` = st.`id`
);

ALTER TABLE `tmp_legacy_full_day_pairs`
  ADD COLUMN `full_day_assignment_id` BIGINT NULL,
  ADD COLUMN `kept_attendance_id` BIGINT NULL;

UPDATE `tmp_legacy_full_day_pairs` p
JOIN `tbl_shift_templates` st ON st.`code` = 'CA-HC'
JOIN `tbl_shift_assignments` fd
  ON fd.`project_id` = p.`project_id`
 AND fd.`user_id` = p.`user_id`
 AND fd.`work_date` = p.`work_date`
 AND fd.`shift_template_id` = st.`id`
SET p.`full_day_assignment_id` = fd.`id`;

-- If the old pair only produced automatic ABSENT rows (no real check-in or
-- checkout evidence), keep one absence row and attach it to the new single
-- assignment.  This removes the misleading two-absence display while
-- retaining the absence result and an audit note.
CREATE TEMPORARY TABLE `tmp_legacy_auto_absence` AS
SELECT
  p.`morning_assignment_id`,
  p.`afternoon_assignment_id`,
  p.`full_day_assignment_id`,
  p.`work_date`,
  MIN(l.`id`) AS `kept_attendance_id`
FROM `tmp_legacy_full_day_pairs` p
JOIN `tbl_attendance_logs` l
  ON l.`shift_assignment_id` IN (p.`morning_assignment_id`, p.`afternoon_assignment_id`)
WHERE l.`status` = 'ABSENT'
  AND l.`check_in_at` IS NULL
  AND l.`check_out_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `tbl_attendance_logs` evidence
    WHERE evidence.`shift_assignment_id` IN (p.`morning_assignment_id`, p.`afternoon_assignment_id`)
      AND (
        evidence.`status` <> 'ABSENT'
        OR evidence.`check_in_at` IS NOT NULL
        OR evidence.`check_out_at` IS NOT NULL
      )
  )
GROUP BY p.`morning_assignment_id`, p.`afternoon_assignment_id`,
         p.`full_day_assignment_id`, p.`work_date`;

UPDATE `tmp_legacy_full_day_pairs` p
JOIN `tmp_legacy_auto_absence` a
  ON a.`morning_assignment_id` = p.`morning_assignment_id`
 AND a.`afternoon_assignment_id` = p.`afternoon_assignment_id`
SET p.`kept_attendance_id` = a.`kept_attendance_id`;

UPDATE `tbl_attendance_logs` l
JOIN `tmp_legacy_auto_absence` a ON a.`kept_attendance_id` = l.`id`
SET l.`shift_assignment_id` = a.`full_day_assignment_id`,
    l.`scheduled_start_at` = TIMESTAMP(a.`work_date`, '08:00:00'),
    l.`scheduled_end_at` = TIMESTAMP(a.`work_date`, '17:30:00'),
    l.`break_minutes` = 90,
    l.`late_minutes` = 0,
    l.`early_leave_minutes` = 0,
    l.`overtime_minutes` = 0,
    l.`overtime_status` = 'NONE',
    l.`overtime_approved_minutes` = 0,
    l.`remarks` = LEFT(CONCAT_WS(' ', l.`remarks`, 'Đã gộp từ hai lượt Full ca cũ thành một lượt 08:00–17:30.'), 255);

-- Remove only duplicate automatic absence rows.  Logs with any real evidence
-- are deliberately retained as historical audit records.
DELETE l
FROM `tbl_attendance_logs` l
JOIN `tmp_legacy_auto_absence` a
  ON l.`shift_assignment_id` IN (a.`morning_assignment_id`, a.`afternoon_assignment_id`)
WHERE l.`id` <> a.`kept_attendance_id`
  AND l.`status` = 'ABSENT'
  AND l.`check_in_at` IS NULL
  AND l.`check_out_at` IS NULL;

-- Hide the two obsolete assignments from active scheduling.  They remain in
-- the database so audit/history references are not broken.
UPDATE `tbl_shift_assignments` sa
JOIN `tmp_legacy_full_day_pairs` p
  ON sa.`id` IN (p.`morning_assignment_id`, p.`afternoon_assignment_id`)
SET sa.`status` = 'CANCELLED',
    sa.`notes` = CONCAT_WS(' · ', sa.`notes`, 'Đã gộp vào Full ca 08:00–17:30');

DROP TEMPORARY TABLE `tmp_legacy_auto_absence`;
DROP TEMPORARY TABLE `tmp_legacy_full_day_pairs`;
