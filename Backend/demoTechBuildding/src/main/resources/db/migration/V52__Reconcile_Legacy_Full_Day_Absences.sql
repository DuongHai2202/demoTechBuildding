-- V51 restored one CA-HC assignment but old automatic absence rows may still
-- point to the cancelled morning/afternoon assignments. Reconcile only those
-- synthetic ABSENT rows; real check-in/check-out evidence remains untouched.
CREATE TEMPORARY TABLE `tmp_full_day_absence_cleanup` AS
SELECT
  fd.`id` AS `full_day_assignment_id`,
  fd.`project_id`,
  fd.`user_id`,
  fd.`work_date`,
  om.`id` AS `morning_assignment_id`,
  oa.`id` AS `afternoon_assignment_id`,
  COALESCE(MIN(fd_log.`id`), MIN(old_log.`id`)) AS `kept_attendance_id`
FROM `tbl_shift_assignments` fd
JOIN `tbl_shift_templates` ft ON ft.`id` = fd.`shift_template_id`
LEFT JOIN `tbl_shift_assignments` om
  ON om.`project_id` = fd.`project_id`
 AND om.`user_id` = fd.`user_id`
 AND om.`work_date` = fd.`work_date`
 AND om.`status` = 'CANCELLED'
 AND om.`notes` LIKE '%Đã gộp vào Full ca 08:00–17:30%'
 AND EXISTS (
   SELECT 1 FROM `tbl_shift_templates` omt
   WHERE omt.`id` = om.`shift_template_id` AND omt.`code` = 'CA-SANG'
 )
LEFT JOIN `tbl_shift_assignments` oa
  ON oa.`project_id` = fd.`project_id`
 AND oa.`user_id` = fd.`user_id`
 AND oa.`work_date` = fd.`work_date`
 AND oa.`status` = 'CANCELLED'
 AND oa.`notes` LIKE '%Đã gộp vào Full ca 08:00–17:30%'
 AND EXISTS (
   SELECT 1 FROM `tbl_shift_templates` oat
   WHERE oat.`id` = oa.`shift_template_id` AND oat.`code` = 'CA-CHIEU'
 )
LEFT JOIN `tbl_attendance_logs` fd_log
  ON fd_log.`shift_assignment_id` = fd.`id`
 AND fd_log.`status` = 'ABSENT'
 AND fd_log.`check_out_at` IS NULL
 AND fd_log.`remarks` LIKE 'Tự động chốt vắng:%'
LEFT JOIN `tbl_attendance_logs` old_log
  ON old_log.`shift_assignment_id` IN (om.`id`, oa.`id`)
 AND old_log.`status` = 'ABSENT'
 AND old_log.`check_out_at` IS NULL
 AND old_log.`remarks` LIKE 'Tự động chốt vắng:%'
WHERE ft.`code` = 'CA-HC'
  AND fd.`notes` LIKE '%Đã gộp từ hai lượt Full ca cũ%'
GROUP BY fd.`id`, fd.`project_id`, fd.`user_id`, fd.`work_date`, om.`id`, oa.`id`;

UPDATE `tbl_attendance_logs` l
JOIN `tmp_full_day_absence_cleanup` c ON c.`kept_attendance_id` = l.`id`
SET l.`shift_assignment_id` = c.`full_day_assignment_id`,
    l.`scheduled_start_at` = TIMESTAMP(c.`work_date`, '08:00:00'),
    l.`scheduled_end_at` = TIMESTAMP(c.`work_date`, '17:30:00'),
    l.`break_minutes` = 90,
    l.`late_minutes` = 0,
    l.`early_leave_minutes` = 0,
    l.`overtime_minutes` = 0,
    l.`overtime_status` = 'NONE',
    l.`overtime_approved_minutes` = 0,
    l.`remarks` = LEFT(CONCAT_WS(' ', l.`remarks`, 'Đã gộp về một lượt Full ca 08:00–17:30.'), 255);

-- Delete only duplicate automatic absence rows. Rows with actual evidence do
-- not match this predicate and are retained for audit/history.
DELETE l
FROM `tbl_attendance_logs` l
JOIN `tmp_full_day_absence_cleanup` c
  ON l.`shift_assignment_id` IN (c.`morning_assignment_id`, c.`afternoon_assignment_id`, c.`full_day_assignment_id`)
WHERE l.`id` <> c.`kept_attendance_id`
  AND l.`status` = 'ABSENT'
  AND l.`check_out_at` IS NULL
  AND l.`remarks` LIKE 'Tự động chốt vắng:%';

DROP TEMPORARY TABLE `tmp_full_day_absence_cleanup`;
