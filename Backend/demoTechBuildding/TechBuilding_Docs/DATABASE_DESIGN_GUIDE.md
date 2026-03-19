# HƯỚNG DẪN THIẾT KẾ & QUẢN LÝ DATABASE

Để thiết kế cơ sở dữ liệu (Database) cho dự án TechBuilding một cách chuyên nghiệp, dễ hình dung từ đầu và dễ nâng cấp về sau, bạn nên thực hiện theo 3 khía cạnh dưới đây:

## 1. Chọn Hệ Quản Trị Cơ Sở Dữ Liệu (RDBMS)

Đối với hệ thống quản lý công trình (TechBuilding) có tính chất dữ liệu quan hệ chặt chẽ (User thuộc Project, Điểm danh thuộc User và Project...), bạn nên dùng SQL truyền thống thay vì NoSQL (như MongoDB).

* **Đề xuất số 1: MySQL 8.0**
  * *Lý do:* Rất phổ biến, tài liệu cực nhiều, dễ cài đặt và tương thích hoàn hảo với Spring Data JPA. Tốc độ thực thi rất tốt cho các query thông thường.
* **Đề xuất số 2: PostgreSQL**
  * *Lý do:* Mạnh mẽ hơn MySQL trong việc xử lý dữ liệu PostGIS (tọa độ bản đồ GPS). Nếu tương lai dự án TechBuilding yêu cầu vẽ Polygon (đa giác) vùng công trường phức tạp để check-in thay vì chỉ tính bán kính đường tròn tĩnh, thì PostgreSQL là lựa chọn số 1.

**👉 Chốt:** Ở giai đoạn v1 này, **MySQL 8.0** là lựa chọn an toàn và nhanh nhất.

## 2. Công Cụ Thiết Kế Trực Quan (Database Design/ERD Tools)

Trước khi gõ code SQL tạo bảng, bạn nên vẽ sơ đồ ERD (Entity Relationship Diagram) để nhìn xem các bảng móc nối với nhau bằng Khóa ngoại (Foreign Key) như thế nào có hợp lý không.

* **DBDiagram.io (Khuyên dùng nhất):**
  * Công cụ online, thiết kế bằng cách gõ text rất nhanh, tự động vẽ ra sơ đồ cực đẹp.
  * Tự động xuất ra script SQL để chạy luôn.
  * Cực kỳ dễ chia sẻ cho team (chỉ cần gửi link).
* **MySQL Workbench:**
  * Phần mềm truyền thống. Vẽ ERD bằng cách kéo thả, hơi nặng và khó thao tác một chút nếu bảng quá nhiều.
* **Draw.io hoặc Miro:**
  * Chỉ dùng để vẽ hình minh hoạ cho sếp hoặc khách hàng xem, không sinh ra được code SQL, nên với lập trình viên thì hơi tốn thời gian.

## 3. Công Cụ Quản Lý Phiên Bản Database (Database Migration Tools) trong Spring Boot

Đây là phần **cực kỳ quan trọng** phân biệt giữa một dự án làm chơi và hệ thống chạy thực tế (Production).
Đừng dùng cách truyền thống là: Thêm 1 cột vào db trên máy mình -> nhắn tin cho đồng nghiệp "nhớ chạy lệnh alter table thêm cột nhé" -> chạy lên server thật bị quên -> Sập App.

**Sử dụng Flyway (Khuyên dùng cho TechBuilding) hoặc Liquibase:**
* Flyway được tích hợp sẵn rất mạnh vào Spring Boot.
* **Cơ chế hoạt động:** 
  1. Bạn tạo thư mục `src/main/resources/db/migration/`.
  2. Tạo file `V1__Init_Tables.sql` (chứa lệnh tạo bảng User, Project).
  3. Tuần sau bạn muốn thêm cột `phone` vào bảng User, bạn tạo file `V2__Add_Phone_To_User.sql`.
  4. Mỗi lần Spring Boot khởi động, Flyway sẽ tự check xem DB hiện tại đã chạy đến version mấy rồi. Nếu file V2 chưa chạy, nó sẽ tự động chạy file V2. Không bao giờ sợ quên script.

---

## BƯỚC TIẾP THEO (NEXT STEP)

Với kiến trúc bảng tôi đã vạch ra ở `GUILD.md`, **tôi có thể viết ngay cho bạn mã DBML để dán vào trang DBDiagram.io để bạn nhìn tổng quan toàn bộ sơ đồ, HOẶC tôi có thể viết thẳng Script SQL MySQL (`V1__Init_Tables.sql`) cho bạn.**

Bạn muốn tôi cung cấp theo định dạng nào trước?
