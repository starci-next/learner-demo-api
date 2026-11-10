<!-- Bản mẫu do AI viết (nháp). Sửa các bước cho đúng dự án của bạn. -->
# concept: transactions-and-isolation

Luồng này chứng minh hai người cùng mua món cuối cùng thì chỉ một người thành công và dữ liệu vẫn nhất quán.

## Chuẩn bị
- Một món có tồn kho đúng 1. Endpoint tạo đơn khai ở `endpoints.transactions-and-isolation`.

## Các bước
1. Đặt tồn kho = 1. Gửi đồng thời hai request tạo đơn cho món đó (hai kết nối, cùng lúc).
2. Mong đợi: đúng một request 2xx, request còn lại bị từ chối có kiểm soát (409 hoặc 4xx tương đương), không có 5xx.
3. Đọc lại tồn kho. Mong đợi: bằng 0, không âm.
4. Đếm đơn của món đó. Mong đợi: đúng một đơn.
5. Cố ý làm bước ghi thứ hai của một đơn thất bại (ví dụ trường bắt buộc rỗng). Mong đợi: bước ghi thứ nhất cũng được hoàn tác (tồn kho không bị trừ).

## Bằng chứng
- Mã trạng thái của hai request ở bước 1, tồn kho và số đơn sau cùng, kết quả bước 5.
- Test có `[transactions-and-isolation]` bao phủ bước 2 tới 5; probe `parallel-last-item` của StarCi bắn request song song vào endpoint đã khai.
