-- Construction-site schedule: split the normal working day into a morning
-- and an afternoon shift. The old full-day template is hidden from new
-- assignments so it cannot conflict with the split schedule.
UPDATE `tbl_shift_templates`
SET `status` = 'INACTIVE'
WHERE `code` = 'CA-HC';

UPDATE `tbl_shift_templates`
SET
  `name` = 'Ca sáng',
  `start_time` = '08:00:00',
  `end_time` = '12:00:00',
  `crosses_midnight` = FALSE,
  `break_minutes` = 0
WHERE `code` = 'CA-SANG';

UPDATE `tbl_shift_templates`
SET
  `name` = 'Ca chiều',
  `start_time` = '13:00:00',
  `end_time` = '17:30:00',
  `crosses_midnight` = FALSE,
  `break_minutes` = 0
WHERE `code` = 'CA-CHIEU';

-- Keep the overnight shift unchanged. Add it to today's demo schedule so
-- the demo can still be exercised outside the daytime window.
INSERT IGNORE INTO `tbl_shift_assignments`
  (`shift_template_id`, `project_id`, `user_id`, `work_date`, `status`, `notes`, `created_by`, `updated_by`)
SELECT st.`id`, pm.`project_id`, pm.`user_id`, CURRENT_DATE, 'ASSIGNED', 'Ca đêm demo khởi tạo tự động', 'SYSTEM', 'SYSTEM'
FROM `tbl_shift_templates` st
JOIN `tbl_project_members` pm ON pm.`is_active` = TRUE
WHERE st.`code` = 'CA-DEM';
