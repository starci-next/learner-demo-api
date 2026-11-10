<!-- Bản mẫu do AI viết (nháp). Sửa các bước cho đúng dự án của bạn. -->
# concept: health-probe-semantics

Luồng này chứng minh dự án phân biệt "tiến trình còn sống" (health) với "sẵn sàng nhận việc" (readiness).

## Chuẩn bị
- Dịch vụ chạy cùng cơ sở dữ liệu (hoặc phụ thuộc chính) mà nó cần để phục vụ.

## Các bước
1. `GET /health` khi mọi thứ bình thường. Mong đợi: 200.
2. `GET /ready` khi mọi thứ bình thường. Mong đợi: 200.
3. Tắt phụ thuộc chính (ví dụ dừng cơ sở dữ liệu), rồi `GET /ready`. Mong đợi: mã khác 200 (thường 503), còn `GET /health` vẫn 200.
4. Bật lại phụ thuộc, đợi vài giây, `GET /ready`. Mong đợi: trở lại 200 mà không phải khởi động lại dịch vụ.

## Bằng chứng
- Mã trạng thái của bốn bước theo thứ tự; bước 3 là bước chứng minh health và readiness khác nhau.
- Test có `[health-probe-semantics]` trong tên bao phủ bước 1 và 2; probe của StarCi gọi `/health` và `/ready`.
