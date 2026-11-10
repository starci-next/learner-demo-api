<!-- Bản mẫu do AI viết (nháp). Sửa các bước cho đúng dự án của bạn. -->
# concept: server-state-cache-lifecycle

Luồng này chứng minh cache của dự án có vòng đời rõ: đọc lặp thì ổn định, ghi thì làm cũ cache, hết hạn thì tải lại.

## Chuẩn bị
- Một endpoint đọc (GET) có cache, ví dụ danh sách sản phẩm; một endpoint ghi làm đổi dữ liệu đó.

## Các bước
1. `GET` endpoint đọc hai lần liên tiếp. Mong đợi: hai phản hồi 2xx có body giống nhau; lần hai không chạm nguồn dữ liệu (log hoặc bộ đếm cho thấy).
2. Gọi endpoint ghi để đổi một bản ghi. Mong đợi: 2xx.
3. `GET` endpoint đọc lại. Mong đợi: body đã chứa thay đổi (cache không trả dữ liệu cũ).
4. Đợi quá thời gian sống (TTL) của cache rồi `GET` lần nữa. Mong đợi: nguồn dữ liệu được chạm đúng một lần, body vẫn đúng.

## Bằng chứng
- Bộ đếm hoặc log "chạm nguồn" ở từng bước; bước 3 là bước dễ sai nhất.
- Test có `[server-state-cache-lifecycle]` bao phủ bước 1 tới 3; probe `repeat-get` của StarCi gọi bước 1.
