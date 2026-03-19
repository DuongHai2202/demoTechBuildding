# GỢI Ý TRIỂN KHAI PHASE 1: FOUNDATION SETUP (THIẾT LẬP NỀN TẢNG)

Phase 1 là nền móng quan trọng nhất của toàn bộ dự án TechBuilding. Nếu làm tốt phần này, các Phase sau (Mobile, Web, Module nghiệp vụ) sẽ phát triển cực kỳ trơn tru và ít gặp lỗi vặt.

Dưới đây là gợi ý chi tiết các công việc cần thống nhất và chuẩn bị **trước khi** bắt đầu viết code:

## 1. MÔI TRƯỜNG PHÁT TRIỂN (DEVELOPMENT ENVIRONMENT)

### 1.1 Khởi tạo Project Spring Boot
*   **Version:** Gợi ý sử dụng **Spring Boot 3.2.x** hoặc mới nhất (tận dụng Spring Framework 6 và Java 17/21).
*   **Java Version:** Nên chọn **Java 17** (LTS rất ổn định) hoặc **Java 21** (LTS mới nhất, hỗ trợ Virtual Threads giúp xử lý API đồng thời tốt hơn).
*   **Build Tool:** Bạn quen dùng **Maven** hay **Gradle**? (Gradle build nhanh hơn, Maven thì phổ biến và dễ cấu hình thư viện hơn ở VN).
*   **Dependencies cơ bản ban đầu:**
    *   `Spring Web` (Tạo REST API).
    *   `Spring Data JPA` (Tương tác Database).
    *   `MySQL Driver` (Kết nối MySQL).
    *   `Lombok` (Giảm boilerplate code như Getter/Setter).
    *   `Spring Boot DevTools` (Hot reload khi code).
    *   `Spring Security` (Sẽ cấu hình sau, nhưng nên có sẵn trong tư duy).

### 1.2 Cấu trúc thư mục (Architecture Pattern)
Với dự án có nhiều module (User, Project, Attendance, Document...), đề xuất sử dụng **Package by Feature** (Chia thư mục theo tính năng) kết hợp Layered Architecture. Điều này giúp dự án dễ scale khi team đông người.

**Gợi ý cấu trúc:**
```text
src/main/java/com/techbuilding/
 ├── config/            # Cấu hình Security, CORS, Swagger, S3...
 ├── exception/         # Xử lý lỗi tập trung (@ControllerAdvice)
 ├── security/          # JWT util, Filter, UserDetailsService
 ├── common/            # Constants, Enums chung
 ├── modules/           # ---> CHIA THEO NGHIỆP VỤ <---
 │   ├── user/
 │   │   ├── model/     # Entity (User, Role...)
 │   │   ├── dto/       # Request/Response Data Transfer Object
 │   │   ├── repo/      # JpaRepository interfaces
 │   │   ├── service/   # Logic nghiệp vụ
 │   │   └── api/       # REST Controllers
 │   ├── project/       # Tương tự cấu trúc trên (Project, Document...)
 │   ├── attendance/    # Tương tự cấu trúc trên
 │   └── worklog/       # Tương tự cấu trúc trên
 └── TechBuildingApplication.java
```

## 2. DATABASE THIẾT KẾ VÀ KHỞI TẠO (SQL / DDL)

Thay vì tạo bảng thủ công bằng giao diện DB Engine (như DBeaver/HeidiSQL/Navicat), trong môi trường dự án thực tế, bạn **rất nên** sử dụng Tool quản lý phiên bản Database.

### 2.1 Tool gợi ý: Flyway hoặc Liquibase
*   **Tại sao cần?** Giúp lưu trữ lịch sử thay đổi các bảng. Khi bạn đẩy code cho Frontend hoặc máy test, ứng dụng sẽ tự động chạy lệnh SQL tạo bảng mà không cần import DB bằng tay.
*   **Gợi ý tiếp theo:** Nếu đồng ý, khi bắt đầu code, tôi sẽ tạo file `V1__Init_Schema.sql` chứa toàn bộ lệnh `CREATE TABLE` chi tiết theo schema mình đã bàn.

### 2.2 Các Config môi trường DB (Dockerized)
*   Nên dùng **Docker Compose** để khởi tạo **MySQL 8.0** và **Redis** ngay trên máy tính của bạn cho sạch, thay vì cài XAMPP hay cài MySQL trực tiếp lên Windows.
*   *Lợi ích:* Chỉ cần 1 lệnh `docker-compose up -d` là bạn có đủ DB MySQL rỗng và Redis để bắt đầu dự án ngay lập tức.

## 3. CHÍNH SÁCH BẢO MẬT & PHÂN QUYỀN (SECURITY STRATEGY)

### 3.1 Giao thức xác thực
*   **Sử dụng Bearer JWT (JSON Web Token):** Phù hợp và bắt buộc cho mô hình Server (Spring Boot) cấp API cho Client (Mobile App, Web React).
*   **Flow chuẩn dự kiến:**
    1.  User gọi `/login` gửi Username/Password.
    2.  Server trả về `access_token` (sống ngắn hạn, vd 1-2 ngày) và `refresh_token` (sống dài hạn, vd 30 ngày lưu ở DB).
    3.  Mobile App cất Token vào Secure Storage của điện thoại, tự động gửi kèm mỗi lần gọi API.

### 3.2 Chuẩn bị cho Cross-Origin Resource Sharing (CORS)
Do API Spring Boot (chạy port `:8080`) sẽ phục vụ Web ReactJS (chạy port `:3000` trên localhost), ta cần chuẩn bị cấu hình cho phép các Domain/Port chỉ định được phép gọi API (tránh lỗi ngớ ngẩn lúc Frontend gọi sang).

## 4. CHUẨN ĐẦU RA API & XỬ LÝ LỖI (RESPONSE STANDARDIZATION)

Bắt buộc **tất cả** API phải trả về một định dạng chuẩn chung nhất (Standard Response Format). Cả lúc thành công `(HTTP 200)` hay lúc lỗi `(HTTP 400, 500)`.

**Ví dụ một format chuẩn tôi thường thiết lập:**
```json
{
  "status": 200,                // HTTP Status
  "message": "Thành công",      // Thông điệp trả về (vd: Tạo dự án thành công / User không tồn tại)
  "data": {                     // Object, Array hoặc null
      "id": 1,
      "name": "Dự án Keangnam"
  },
  "timestamp": "2026-03-03T10:00:00"
}
```
*   **Tại sao cần?** Giúp cho các bạn làm Frontend Mobile đọc json một cách mù quáng, không bao giờ sợ lỗi Null Pointer Exception hay khác biệt format giữa ông dev này làm API khác ông kia.
*   **Giải pháp Code:** Sử dụng `@RestControllerAdvice` trong Spring Boot để chặn mọi lỗi (ví dụ: Thiếu field bắt buộc, tìm không thấy User trong DB) và ép nó trả về format JSON chuẩn này thay vì quăng cái trang Error 500 mặc định mầu trắng của Tomcat.

---

### TRẢ LỜI CÁC CÂU HỎI SAU ĐỂ CHÚNG TA CHỐT PHASE 1:

1.  Bạn định dùng **Java bao nhiêu** (17 hay 21) và Build tool là **Maven** hay **Gradle**?
2.  Bạn có muốn tôi viết file `docker-compose.yml` để bạn chạy MySQL + Redis một cách tiện lợi ngay bây giờ không?
3.  Với cái **Standard Response Format** ở mục 4, bạn có đồng ý áp dụng kiểu gói Data đồng nhất đó cho toàn bộ Project không?
4.  Bạn muốn dùng **Flyway** (Quản lý Schema bằng file .sql) hay để **Hibernate/JPA** tự động sinh bảng (auto-dtl = update) cho nhanh trong thời gian đầu?
