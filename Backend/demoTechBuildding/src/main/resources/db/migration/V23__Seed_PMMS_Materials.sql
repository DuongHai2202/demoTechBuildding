-- V23: Seed 35 PMMS Materials across 7 Categories

INSERT INTO `tbl_materials` 
(`category_id`, `management_code`, `name_vi`, `name_en`, `name_zh`, `unit`, `description_vi`, `description_en`, `description_zh`, `revit_family_category`, `revit_code`, `image_url`) 
VALUES 
-- Category 1: Nhân công
(1, 'LAB-001', 'Thợ xây bậc 3/7', 'Mason Grade 3/7', '3/7级砖瓦工', 'Công', 'Nhân công xây tô', 'Masonry worker', '砌筑工', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/1004/1004381.png'),
(1, 'LAB-002', 'Thợ sắt bậc 4/7', 'Steel worker Grade 4/7', '4/7级钢筋工', 'Công', 'Nhân công gia công thép', 'Steel processing worker', '钢筋加工工人', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/1004/1004381.png'),
(1, 'LAB-003', 'Thợ mộc bậc 3/7', 'Carpenter Grade 3/7', '3/7级木工', 'Công', 'Nhân công cốp pha', 'Formwork carpenter', '模板木工', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/1004/1004381.png'),
(1, 'LAB-004', 'Thợ điện bậc 4/7', 'Electrician Grade 4/7', '4/7级电工', 'Công', 'Nhân công lắp đặt điện', 'Electrical installation worker', '电气安装工', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/1004/1004381.png'),
(1, 'LAB-005', 'Kỹ sư giám sát', 'Supervising Engineer', '监理工程师', 'Tháng', 'Kỹ sư giám sát hiện trường', 'Field supervising engineer', '现场监理工程师', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/1004/1004381.png'),

-- Category 2: Vật liệu xây dựng
(2, 'BLD-001', 'Xi măng PC40', 'Portland Cement PC40', 'PC40硅酸盐水泥', 'Bao', 'Xi măng đổ bê tông', 'Concrete pouring cement', '浇灌混凝土水泥', 'Structural Connections', 'MT-PC40', 'https://cdn-icons-png.flaticon.com/512/2822/2822180.png'),
(2, 'BLD-002', 'Cát vàng', 'Yellow Sand', '黄沙', 'm3', 'Cát dùng để trộn bê tông', 'Sand for concrete mixing', '混凝土拌和用沙', 'Topography', 'MT-YSND', 'https://cdn-icons-png.flaticon.com/512/2822/2822180.png'),
(2, 'BLD-003', 'Gạch ống 4 lỗ', '4-hole Brick', '4孔砖', 'Viên', 'Gạch xây tường bao', 'Brick for partition walls', '隔墙用砖', 'Walls', 'MT-BR4H', 'https://cdn-icons-png.flaticon.com/512/2822/2822180.png'),
(2, 'BLD-004', 'Thép cuộn D8', 'Coil Steel D8', 'D8盘条钢筋', 'Kg', 'Thép đai', 'Stirrup steel', '箍筋', 'Structural Rebar', 'MT-ST8', 'https://cdn-icons-png.flaticon.com/512/2822/2822180.png'),
(2, 'BLD-005', 'Đá 1x2', 'Crushed Stone 1x2', '1x2碎石', 'm3', 'Đá cấp phối bê tông', 'Crushed stone for concrete', '混凝土级配碎石', 'Topography', 'MT-ST12', 'https://cdn-icons-png.flaticon.com/512/2822/2822180.png'),

-- Category 3: Hệ thống HVAC
(3, 'HVAC-001', 'Ống gió tôn mạ kẽm', 'Galvanized Iron Duct', '镀锌铁皮风管', 'm2', 'Ống cấp gió tươi', 'Fresh air duct', '新风管道', 'Ducts', 'HVAC-GD', 'https://cdn-icons-png.flaticon.com/512/3253/3253244.png'),
(3, 'HVAC-002', 'Máy lạnh trung tâm VRV', 'VRV Central Air Conditioner', 'VRV中央空调', 'Bộ', 'Cục nóng VRV 10HP', 'VRV Outdoor Unit 10HP', 'VRV室外机10HP', 'Mechanical Equipment', 'HVAC-VRV10', 'https://cdn-icons-png.flaticon.com/512/3253/3253244.png'),
(3, 'HVAC-003', 'Miệng gió khuếch tán', 'Diffuser Grille', '散流器', 'Cái', 'Miệng gió nhôm 600x600', 'Aluminum diffuser 600x600', '铝制散流器600x600', 'Air Terminals', 'HVAC-DG60', 'https://cdn-icons-png.flaticon.com/512/3253/3253244.png'),
(3, 'HVAC-004', 'Quạt hút mái', 'Roof Exhaust Fan', '屋顶排风机', 'Cái', 'Quạt hút ly tâm', 'Centrifugal exhaust fan', '离心排风机', 'Mechanical Equipment', 'HVAC-FANR', 'https://cdn-icons-png.flaticon.com/512/3253/3253244.png'),
(3, 'HVAC-005', 'Ống đồng cuộn', 'Copper Tubing Coil', '铜管盘管', 'Cuộn', 'Ống đồng dày 0.8mm', 'Copper tube 0.8mm thick', '0.8mm厚铜管', 'Pipes', 'HVAC-COP08', 'https://cdn-icons-png.flaticon.com/512/3253/3253244.png'),

-- Category 4: Hệ thống Điện - Điện nhẹ
(4, 'ELE-001', 'Cáp điện CXV 4x16', 'CXV Power Cable 4x16', 'CXV电力电缆 4x16', 'm', 'Cáp nguồn tổng', 'Main power cable', '主电源电缆', 'Wires', 'ELE-CXV416', 'https://cdn-icons-png.flaticon.com/512/3067/3067332.png'),
(4, 'ELE-002', 'Ống luồn dây điện PVC 20mm', 'PVC Conduit 20mm', '20mm PVC穿线管', 'Ống', 'Ống luồn âm tường', 'Concealed conduit', '暗装穿线管', 'Conduits', 'ELE-PVC20', 'https://cdn-icons-png.flaticon.com/512/3067/3067332.png'),
(4, 'ELE-003', 'Đèn LED Panel 600x600', 'LED Panel Light 600x600', '600x600 LED平板灯', 'Bộ', 'Đèn chiếu sáng văn phòng', 'Office lighting panel', '办公室照明平板灯', 'Lighting Fixtures', 'ELE-LED60', 'https://cdn-icons-png.flaticon.com/512/3067/3067332.png'),
(4, 'ELE-004', 'Camera IP Dome 2MP', 'IP Dome Camera 2MP', '200万像素IP半球摄像机', 'Cái', 'Camera giám sát hành lang', 'Hallway surveillance camera', '走廊监控摄像机', 'Security Devices', 'ELE-CAM2M', 'https://cdn-icons-png.flaticon.com/512/3067/3067332.png'),
(4, 'ELE-005', 'Tủ điện phân phối DB', 'Distribution Board', '配电箱', 'Tủ', 'Tủ điện tầng', 'Floor distribution board', '楼层配电箱', 'Electrical Equipment', 'ELE-DB', 'https://cdn-icons-png.flaticon.com/512/3067/3067332.png'),

-- Category 5: Cấp thoát nước (CTN)
(5, 'PLU-001', 'Ống uPVC D90', 'uPVC Pipe D90', 'D90 uPVC管', 'Ống', 'Ống thoát nước trục đứng', 'Vertical drainage pipe', '立管排水管', 'Pipes', 'PLU-UPVC90', 'https://cdn-icons-png.flaticon.com/512/3067/3067425.png'),
(5, 'PLU-002', 'Bơm tăng áp', 'Booster Pump', '增压泵', 'Máy', 'Bơm tăng áp tầng mái', 'Roof booster pump', '屋顶增压泵', 'Plumbing Fixtures', 'PLU-PUMP', 'https://cdn-icons-png.flaticon.com/512/3067/3067425.png'),
(5, 'PLU-003', 'Phễu thu sàn Inox', 'Stainless Steel Floor Drain', '不锈钢地漏', 'Cái', 'Phễu D114 chống hôi', 'Anti-odor floor drain D114', '防臭地漏D114', 'Plumbing Fixtures', 'PLU-FD114', 'https://cdn-icons-png.flaticon.com/512/3067/3067425.png'),
(5, 'PLU-004', 'Van bi đồng ren D25', 'Brass Threaded Ball Valve D25', 'D25黄铜螺纹球阀', 'Cái', 'Van chặn nước cấp', 'Water supply shut-off valve', '供水截止阀', 'Pipe Accessories', 'PLU-BV25', 'https://cdn-icons-png.flaticon.com/512/3067/3067425.png'),
(5, 'PLU-005', 'Ống PPR D25', 'PPR Pipe D25', 'D25 PPR管', 'm', 'Ống cấp nước nóng lạnh', 'Hot/cold water supply pipe', '冷热水供水管', 'Pipes', 'PLU-PPR25', 'https://cdn-icons-png.flaticon.com/512/3067/3067425.png'),

-- Category 6: Vật tư phụ
(6, 'SUP-001', 'Keo bọt nở PU', 'PU Foam', 'PU发泡胶', 'Chai', 'Keo chèn khe hở', 'Gap filling foam', '缝隙填充发泡胶', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2822/2822181.png'),
(6, 'SUP-002', 'Bulong M10x50', 'M10x50 Bolt', 'M10x50螺栓', 'Con', 'Bulong liên kết', 'Connection bolt', '连接螺栓', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2822/2822181.png'),
(6, 'SUP-003', 'Tắc kê sắt M8', 'M8 Drop-in Anchor', 'M8拉爆螺丝', 'Con', 'Tắc kê đóng trần', 'Ceiling drop-in anchor', '吊顶拉爆螺丝', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2822/2822181.png'),
(6, 'SUP-004', 'Băng keo điện', 'Electrical Tape', '绝缘胶带', 'Cuộn', 'Băng keo cách điện Nano', 'Nano electrical insulation tape', '纳米绝缘胶带', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2822/2822181.png'),
(6, 'SUP-005', 'Que hàn Việt Đức', 'Vietnam-Germany Welding Rod', '越德焊条', 'Hộp', 'Que hàn 3.2mm', '3.2mm welding rod', '3.2mm焊条', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2822/2822181.png'),

-- Category 7: Thiết bị bảo hộ
(7, 'PPE-001', 'Mũ bảo hộ công trường', 'Construction Safety Helmet', '工地安全帽', 'Cái', 'Mũ SSK', 'SSK Safety helmet', 'SSK安全帽', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2550/2550293.png'),
(7, 'PPE-002', 'Giày bảo hộ mũi thép', 'Steel-toe Safety Shoes', '钢包头劳保鞋', 'Đôi', 'Giày chống đinh', 'Anti-puncture safety shoes', '防穿刺劳保鞋', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2550/2550293.png'),
(7, 'PPE-003', 'Áo phản quang', 'Reflective Safety Vest', '反光安全服', 'Cái', 'Áo ghile phản quang', 'Reflective vest', '反光背心', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2550/2550293.png'),
(7, 'PPE-004', 'Dây đai an toàn toàn thân', 'Full Body Safety Harness', '全身式安全带', 'Bộ', 'Dây an toàn chống rơi ngã', 'Fall protection safety harness', '防坠落安全带', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2550/2550293.png'),
(7, 'PPE-005', 'Găng tay bảo hộ', 'Safety Gloves', '劳保手套', 'Đôi', 'Găng tay sợi phủ cao su', 'Rubber-coated yarn gloves', '挂胶纱线手套', NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/2550/2550293.png');
