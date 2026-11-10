<!-- Bản mẫu do AI viết (nháp). Sửa các bước cho đúng dự án của bạn. -->
# concept: idempotency

Luồng này chứng minh gửi lặp cùng một yêu cầu (cùng `Idempotency-Key`) không tạo thêm tác dụng phụ.

## Chuẩn bị
- Một endpoint ghi có tác dụng phụ đếm được (tạo thanh toán, gửi email, trừ tiền). Khai ở `endpoints.idempotency`.

## Các bước
1. Gửi request với header `Idempotency-Key: k-1`. Mong đợi: 2xx, tác dụng phụ xảy ra đúng một lần.
2. Gửi lại đúng request đó với cùng `Idempotency-Key: k-1`. Mong đợi: 2xx và body GIỐNG HỆT lần đầu.
3. Đếm tác dụng phụ (bản ghi, email, lần gọi nhà cung cấp). Mong đợi: vẫn đúng một.
4. Gửi `Idempotency-Key: k-1` với body KHÁC. Mong đợi: bị từ chối (409 hoặc 422), không thực hiện.
5. Gửi `Idempotency-Key: k-2` cùng body ban đầu. Mong đợi: một tác dụng phụ mới (khoá khác là việc khác).

## Bằng chứng
- Hai body ở bước 1 và 2 giống nhau, số tác dụng phụ sau bước 3 và bước 5.
- Test có `[idempotency]` bao phủ bước 1 tới 5; probe `repeat-same-key` của StarCi gửi hai lần cùng khoá và so hai phản hồi (số tác dụng phụ do test của bạn đếm, probe không thấy được).
