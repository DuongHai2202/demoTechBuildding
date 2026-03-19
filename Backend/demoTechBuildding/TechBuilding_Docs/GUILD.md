# TÀI LIỆU KỸ THUẬT HỆ THỐNG TECHBUILDING (V2)

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
**TechBuildding** là nền tảng chuyển đổi số trong việc quản lý và giám sát thi công công trình xây dựng. Hệ thống giúp ban quản lý dự án (PM), cán bộ kỹ thuật hiện trường, và công nhân tương tác trực tiếp, báo cáo tiến độ, quản lý vật tư và tài liệu một cách minh bạch, có kiểm soát theo thời gian thực (real-time).

## 2. KIẾN TRÚC HỆ THỐNG GỢI Ý
* **Core Backend:** Spring Boot 3.x (Modular Monolith, REST API, Spring Security JWT, Spring Data JPA/Hibernate).
* **Database:** MySQL 8.0 / PostgreSQL cho dữ liệu quan hệ. Redis dùng làm Caching (Lưu session, OTP, master data tránh query DB liên tục).
* **Message Broker (Tùy chọn mở rộng):** RabbitMQ / Apache Kafka. Giúp xử lý bất đồng bộ các tác vụ nặng (Gửi thông báo Push, xử lý export báo cáo PDF/Excel).
* **Web Management:** ReactJS / Next.js hoặc VueJS. Sử dụng cho Dashboard quản lý tập trung trên PC.
* **Mobile App:** React Native hoặc Flutter (Build đa nền tảng iOS/Android dùng cho kỹ sư hiện trường). Yêu cầu kỹ thuật cốt lõi: Offline-first, định vị GPS background, Camera, local storage (SQLite/Hive).
* **Storage:** Amazon S3 hoặc MinIO (Self-hosted) để lưu trữ hình ảnh hiện trường, bản vẽ kỹ thuật dung lượng lớn.
* **DevOps/Deployment:** Docker nén toàn bộ môi trường.

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (SQL SCHEMA MỞ RỘNG)

Ngoài các bảng cơ bản bạn đã vạch ra, tôi bổ sung một số nhóm module không thể thiếu cho các dự án xây dựng:

### 3.1 Nhóm Quản trị hệ thống & Dự án
* **users:** `id (PK)`, `username`, `password_hash`, `full_name`, `role_id (FK)`, `phone`, `email`, `device_id` (Khóa định danh thiết bị Mobile khóa tài khoản).
* **roles:** `id (PK)`, `role_name` (SUPER_ADMIN, PROJECT_MANAGER, SITE_SUPERVISOR, WORKER).
* **projects:** `id (PK)`, `name`, `address`, `latitude`, `longitude`, `radius` (Bán kính cho phép chấm công - mét), `start_date`, `end_date`, `status` (PLANNING, IN_PROGRESS, COMPLETED).

### 3.2 Nhóm Chấm công & Nhân sự (Attendance)
* **attendance_logs:** `id (PK)`, `user_id (FK)`, `project_id (FK)`, `check_in_time`, `check_out_time`, `gps_lat_in`, `gps_long_in`, `gps_lat_out`, `gps_long_out`, `status` (VALID, INVALID, PENDING), `selfie_url` (Ảnh check-in nhận diện).

### 3.3 Nhóm Tiến độ & Báo cáo công việc (Daily Work Logs)
* **work_logs:** `id (PK)`, `project_id (FK)`, `user_id (FK)`, `weather_condition` (Thời tiết), `worker_count` (Số công nhân làm hôm nay), `content_text`, `created_at`.
* **media_attachments:** `id (PK)`, `log_id (FK)`, `file_url`, `file_type` (IMAGE, AUDIO, VIDEO), `metadata` (Lưu dung lượng, vị trí chụp, định dạng).

### 3.4 Nhóm Tài liệu kỹ thuật & Bản vẽ (DMS)
* **documents:** `id (PK)`, `project_id (FK)`, `title`, `category` (DRAWING, CONTRACT, LEGAL, BOQ - Bảng tiên lượng/khối lượng).
* **document_versions:** `id (PK)`, `doc_id (FK)`, `version_number`, `file_url`, `is_latest (Boolean)`, `approved_by (FK)`, `created_at`.

### 3.5 Nhóm Vật tư & Kho bãi (Inventory & Materials) - *[Gợi ý thêm]*
* Ít có công trình nào không quản lý vật tư. Giao diện này để Kỹ sư xin cấp vật tư nhanh từ nhà thầu/công ty.
* **materials:** `id`, `project_id`, `name`, `unit` (kg, tấn, bao, bao), `estimated_quantity` (Khối lượng dự toán ban đầu).
* **material_requests:** `id`, `project_id`, `material_id`, `requested_qty`, `status` (PENDING, APPROVED, DELIVERED), `requested_by`.

### 3.6 Nhóm Quản lý sự cố thi công (Snag List / Issue Tracking) - *[Gợi ý thêm]*
* Hệ thống giao việc/ticketing trực tiếp trên công trường (Ví dụ: Thấy tường trát lỗi -> Chụp ảnh mở ticket yêu cầu sửa).
* **issues:** `id`, `project_id`, `title`, `description`, `assignee_id`, `status` (OPEN, FIXING, RESOLVED), `priority` (LOW, HIGH, URGENT).

### 3.7 Nhóm Hành chính & Văn phòng (HRM & E-Office)
* **e_office_docs:** `id`, `sender_id`, `receiver_id`, `doc_type` (INCOMING, OUTGOING, NOTICE), `title`, `content`, `file_url`, `status`, `created_at`.
* **e_signatures:** `id`, `doc_id`, `user_id`, `signature_data` (VNPT Smart CA/Token), `signed_at`.

### 3.8 Nhóm Quản lý Hợp đồng & Đấu thầu
* **bidding_packages:** `id`, `project_id`, `name`, `status`, `start_date`, `end_date`.
* **contracts:** `id`, `bidding_id`, `partner_id`, `contract_number`, `value`, `status` (ACTIVE, COMPLETED, CANCELLED).
* **boq_items (Hạng mục công việc / Bill of Quantities):** `id`, `contract_id`, `item_code`, `description`, `unit`, `quantity`, `unit_price`, `bim_element_id` (Liên kết với thư viện BIM do Revit bốc tách).


---

## 4. ĐẶC TẢ NGHIỆP VỤ CHI TIẾT & UX/UI LÝ TƯỞNG

### Chức năng 1: Chấm công thông minh (Smart Geofencing Attendance)
* **Luồng xử lý:** Vẫn giữ logic khoảng cách Haversine.
* **Bảo mật bổ sung:** 
  - Ngăn chặn App giả lập GPS (Fake GPS) trên Android/iOS.
  - Yêu cầu chụp ảnh Selfie ngay tại ứng dụng lúc check-in (Không cho chọn ảnh từ thư viện Gallery).
  - Tự động đánh dấu `INVALID` nếu phát hiện Check-in ngoài vùng cấp phép.

### Chức năng 2: Ghi chép nhật ký công trình (Offline-First Daily Reports) 
* **Trải nghiệm offline:** Do công trường tầng hầm hoặc vùng sâu thường mất sóng 4G/5G, Mobile App **bắt buộc** phải lưu data (chữ, hình ảnh cache) vào local DB (như SQLite/Room/Hive) của điện thoại.
* **Auto-Sync:** Khi thiết bị được kết nối internet trở lại, ứng dụng tự động chạy Background Worker đồng bộ (upload ngầm) hình ảnh lên server. Ảnh tải lên có đóng Dấu bản quyền (Watermark) thời gian & dự án.

### Chức năng 3: Quản lý Bản vẽ (Document Version Control)
* **Quét Mã QR Xác Thực:** Đóng dấu 1 mã QR tĩnh vào các bản vẽ in giấy. Nếu một kỹ sư hiện trường cầm bản giấy quét mã QR, Mobile App sẽ check API và báo: "Bản vẽ này đã KHÔNG CÒN HIỆU LỰC, đã có Version 3.1 mới hơn" (Tránh tình trạng thi công nhầm bản vẽ cũ gây lãng phí khổng lồ).

### Chức năng 4: Quản lý Yêu cầu Vật tư (Material Procurement) - *[Tính năng mới]*
* Kỹ sư vào App -> Chọn Xi măng -> Nhập 500 bao -> Tạo [Request].
* Leader nhận Notification trên App Web/Mobile -> Bấm Approve hoặc Reject với lý do.

---

## 5. LỘ TRÌNH 4 NGÀY SIÊU TỐC (MVP FAST-TRACK)

Để kịp bàn giao sau 4 ngày, chúng ta sẽ cắt tỉa các tính năng phụ và tập trung vào **"Xương sống"** của hệ thống:

**Ngày 1: Foundation & Base Framework (Hạ tầng & Khung xương)**
*   Hoàn thiện Docker (MySQL + Redis + MinIO).
*   Khởi tạo Spring Boot 3.x với cấu trúc Folder chuẩn (Controller, Service, Repository, DTO, Mapper). 
*   Triển khai Security (JWT Login) & Phân quyền cơ bản.
*   Cơ chế Upload ảnh lên MinIO.

**Ngày 2: Project & Personnel Management (Quản lý Dự án & Nhân sự)**
*   API CRUD Dự án (Lưu tọa độ GPS tâm và bán kính Geofencing).
*   API CRUD User & Gán nhân sự vào dự án.
*   Xây dựng Logic tính khoảng cách Haversine chuẩn xác.

**Ngày 3: Smart Attendance & Reporting (Chấm công & Báo cáo)**
*   Hoàn thiện API Check-in/Check-out (Xác thực GPS + Ảnh Selfie).
*   API Lấy lịch sử chấm công cá nhân và dự án.
*   Chức năng xuất báo cáo Excel đơn giản cho bảng công.

**Ngày 4: Final Polish & Demo (Tối ưu & Bàn giao)**
*   Xử lý lỗi (Exception Handling) & Validate dữ liệu đầu vào.
*   Dựng tài liệu hướng dẫn API (Swagger/Postman).
*   Deploy thử nghiệm và đóng gói (Docker Image).

---

## 5. LỘ TRÌNH TRIỂN KHAI DÀI HẠN (THAM KHẢO)
*(Phần này dành cho việc phát triển sau khi đã bàn giao bản MVP)*
1. **Thiết lập môi trường:** Hoàn thiện `docker-compose` (MySQL, Redis, MinIO).
2. **Khởi tạo dự án:** Cấu hình Spring Boot 3.x, tích hợp Flyway cho migration.
3. **Cấu trúc dữ liệu:** Chạy script SQL V1 khởi tạo toàn bộ bảng theo ERD.
4. **Security & Auth:** Triển khai JWT, Refresh Token, phân quyền RBAC (Admin, PM, Worker).
5. **Storage Service:** Xây dựng module upload/download file tương tác với MinIO/S3.
6. **Base Module:** Viết các Base class (Response, Exception, Audit) dùng chung.

**Phase 2: Core Business - Personnel & Project (Nhân sự & Dự án - Tuần 3-5)**
1. **Quản trị User:** API CRUD người dùng, chức năng Reset Password, khóa tài khoản.
2. **Quản trị Dự án:** Tạo dự án, thiết lập tọa độ tâm và bán kính Geofencing.
3. **Quản lý Thành viên:** API gán/gỡ nhân sự vào từng dự án cụ thể.
4. **Logic Chấm công:** Xây dựng Service tính khoảng cách Haversine.
5. **API Chấm công:** Luồng Check-in/Check-out kèm xác thực GPS và chụp ảnh Selfie.
6. **E-Office Basic:** Số hóa quy trình gửi/nhận văn bản nội bộ đơn giản.

**Phase 3: Procurement & Contract (Vật tư & Hợp đồng - Tuần 6-8)**
1. **Danh mục Vật tư:** Quản lý danh sách vật tư, đơn vị tính, đơn giá dự toán.
2. **Yêu cầu Vật tư (Material Request):** Xây dựng luồng Đề xuất -> Duyệt (PM) -> Thông báo.
3. **Quản lý Đấu thầu:** Module tạo gói thầu, mời nhà thầu tham gia.
4. **Hợp đồng & BOQ:** Quản lý hợp đồng ký kết, phân rã khối lượng công việc (BOQ).
5. **Kiểm soát chi phí:** Theo dõi giá trị hợp đồng và lũy kế thanh toán.

**Phase 4: Site Observation & Digital Reports (Nhật ký & Hiện trường - Tuần 9-11)**
1. **Nhật ký thi công:** API lưu trữ báo cáo ngày (thời tiết, nhân công, nội dung).
2. **Multimedia handling:** Xử lý nén ảnh, lưu trữ video/audio hiện trường.
3. **Quản lý Bản vẽ:** Versioning cho bản vẽ, cơ chế sinh mã QR code định danh.
4. **Offline Sync Logic:** (Backend side) Xây dựng API tiếp nhận dữ liệu đồng bộ hàng loạt.
5. **Giao việc & Sự cố (Issue Tracking):** Tạo ticket lỗi từ hiện trường, gán cho nhà thầu xử lý.

**Phase 5: Integration, Analytics & DevOps (Hoàn thiện & Triển khai - Tuần 12+)**
1. **Thông báo Real-time:** Tích hợp Firebase Cloud Messaging (FCM) hoặc WebSocket.
2. **Báo cáo & Thống kê:** Xuất file PDF Nhật ký, Excel bảng công, biểu đồ tiến độ.
3. **Dashboard:** Màn hình tổng quan cho Ban lãnh đạo (EVM, S-Curve).
4. **CI/CD Pipeline:** Tự động hóa Build & Deploy bằng GitHub Actions.
5. **Giám sát:** Cấu hình Prometheus, Grafana và Log nội bộ để theo dõi lỗi.


---

## 6. CHIẾN LƯỢC TRIỂN KHAI (DEPLOYMENT VÀ CI/CD)

Phần Deployment cho dự án TechBuilding (đặc biệt là phục vụ công trường thực tế với nhiều hình ảnh, dữ liệu đo đạc) cần đảm bảo tính sẵn sàng cao, bảo mật và dễ dàng cập nhật.

### 6.1 Môi trường triển khai (Environments)
Hệ thống nên được chia ít nhất thành 2 môi trường:
* **Staging (UAT - User Acceptance Testing):** Dành cho đội ngũ kỹ sư/quản lý test thử các tính năng mới trước khi đưa vào thực tế chạy ngoài công trường.
* **Production:** Môi trường chạy thật cho các dự án đang thi công, đòi hỏi SLA (Thời gian uptime) cao, backup dữ liệu hàng ngày.

### 6.2 Kiến trúc hạ tầng (Infrastructure)
* **Máy chủ (VPS/Cloud):** Sử dụng các dịch vụ Cloud như AWS (EC2), Google Cloud, DigitalOcean hoặc các nhà cung cấp nội địa (Viettel IDC, FPT) để đảm bảo tốc độ mạng trong nước khi tải bản vẽ nặng.
* **Containerization:** Đóng gói toàn bộ ứng dụng (Spring Boot, ReactJS) bằng **Docker**. Sử dụng **Docker Compose** để quản lý các service (App, Redis) trên môi trường Staging/Production nhỏ. Nếu hệ thống lớn có thể dùng Kubernetes (K8s).
* **Reverse Proxy & SSL:** Sử dụng **Nginx** làm Reverse Proxy để điều hướng traffic vào các container, đồng thời cấu hình chứng chỉ bảo mật HTTPS (Let's Encrypt) bắt buộc cho tất cả API (bảo mật tọa độ GPS, ảnh check-in tự sướng).
* **Storage (Lưu trữ file/Tĩnh):** Không lưu ảnh/bản vẽ trực tiếp trên server cài API. Bắt buộc dùng Object Storage (như Amazon S3, hoặc dựng **MinIO** Server tự host để tiết kiệm chi phí) để lưu trữ.

### 6.3 Quy trình CI/CD (Tích hợp & Triển khai liên tục)
Tự động hóa hoàn toàn quy trình build và deploy giảm thiểu rủi ro:
* **Source Control:** GitHub hoặc GitLab.
* **Pipeline Tool:** GitHub Actions hoặc GitLab CI.
* **Luồng triển khai:**
  1. Developer push code lên nhánh Release/Main.
  2. Pipeline tự động build ứng dụng Spring Boot ra file `.jar` và React ra static files.
  3. Đóng gói thành Docker Image.
  4. Push Image lên Docker Registry.
  5. SSH ngầm vào Server tự động kéo Image mới nhất về và restart container (Downtime gần như bằng 0).

### 6.4 Giám sát hệ thống & Log (Monitoring)
* Sử dụng **Prometheus & Grafana** để theo dõi lượng RAM, CPU, bộ nhớ của Server và Database.
* Sử dụng **ELK Stack (Elasticsearch, Logstash, Kibana)** để thu thập log tập trung cho API Spring Boot (giúp lập trình viên nhanh chóng tra cứu lỗi khi người dùng sử dụng ngoài công trường báo lỗi).

---

*Lưu ý: Tài liệu này là Blueprint (Bản vẽ phác thảo). Code thực tế sẽ được triển khai theo đúng từng Phase khi nào có yêu cầu (Prompt) Cụ thể từ bạn.*