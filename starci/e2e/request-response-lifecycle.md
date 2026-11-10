<!-- Bản mẫu do AI viết (nháp). Sửa các bước cho đúng dự án của bạn. -->
# concept: request-response-lifecycle

Luồng này chứng minh dự án đặt logic đúng tầng: request sai bị chặn trước handler, request đúng đi hết tới handler.

## Chuẩn bị
- Dịch vụ đang chạy ở `baseUrl` trong `starci/project.yaml`; endpoint của concept này được khai ở `endpoints.request-response-lifecycle`.

## Các bước
1. Gửi request hợp lệ tới endpoint. Mong đợi: mã 2xx, body đúng hợp đồng, header `x-request-id` có trong phản hồi.
2. Gửi cùng request nhưng body là JSON hỏng. Mong đợi: mã 4xx, handler KHÔNG chạy (không có dòng log hay bản ghi nào mới).
3. Gửi request thiếu một trường bắt buộc. Mong đợi: mã 4xx với thông báo nói rõ trường thiếu.
4. Gửi request có `x-request-id` do bạn đặt. Mong đợi: phản hồi và log của lần đó mang đúng id này.

## Bằng chứng
- Ghi mã trạng thái và `x-request-id` của từng bước; bước 2 và 3 kèm ảnh chụp log cho thấy handler không chạy.
- Test có `[request-response-lifecycle]` trong tên bao phủ bước 1 tới 3; probe của StarCi gọi lại bước 2 và bước 4.
