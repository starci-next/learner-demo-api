<!-- Bản nháp do AI viết (status: draft, author: ai-placeholder). Thầy duyệt trước khi dùng thật. -->
# Thư mục starci/ trong dự án của bạn

Dự án là của bạn: chủ đề, ngôn ngữ, cấu trúc tuỳ bạn. Thư mục `starci/` chỉ là chỗ bạn nói cho StarCi biết cách chạy dự án và bằng chứng nằm ở đâu. Không có dự án mẫu.

## Khởi tạo và chạy

```
starci-next init      # chép starci/ (project.yaml, e2e/, report.mjs) và gợi ý workflow CI vào dự án
starci-next run       # chạy test của bạn, gửi kết quả từ máy bạn lên StarCi
```

`init` hỏi ngôn ngữ (typescript, java, csharp, go), điền `project` và `language` trong `starci/project.yaml`, rồi chép `starci/e2e/*.md` cho các concept bạn chọn. Bạn sửa `test.command`, `start` và `endpoints` cho đúng dự án.

## Đang luyện và Đã chứng minh

- **Đang luyện**: kết quả chạy trên máy bạn (`starci-next run`) hoặc một lần chạy CI mà GitHub chưa chứng thực. Giúp bạn thấy mình đang đúng hay sai, nhưng chưa tính là bằng chứng.
- **Đã chứng minh**: kết quả của một lần chạy CI đã được GitHub chứng thực (OIDC) cho đúng repo gắn với dự án, kết quả probe của server, hoặc bài đọc code của AI thầy. Concept được tính một lần khi đủ các nhóm bằng chứng.

Concept hành vi cần: một test hoặc luồng e2e, và probe. Concept cấu trúc cần AI đọc code bạn chỉ vào. Probe là bộ kiểm tra chung của StarCi gọi vào endpoint bạn khai trong `project.yaml`; bạn không sửa được chúng.

## Gắn nhãn test bằng [concept]

Đặt id concept trong ngoặc vuông ngay trong tên test, ví dụ `[idempotency]`. Test không có nhãn thì không tính cho concept nào. Test bị skip không tính.

Test phải ghi JUnit XML vào `starci/reports/`. Lệnh mẫu:

| Ngôn ngữ | Tên test có nhãn | Lệnh ghi JUnit XML |
| --- | --- | --- |
| TypeScript, `node:test` | `test("[idempotency] cùng khoá trả cùng kết quả", ...)` | `node --test --test-reporter=junit --test-reporter-destination=starci/reports/junit.xml` |
| TypeScript, vitest | `it("[idempotency] cùng khoá trả cùng kết quả", ...)` | `npx vitest run --reporter=junit --outputFile=starci/reports/junit.xml` |
| TypeScript, jest | `it("[idempotency] ...", ...)` | `npx jest --reporters=jest-junit` với `JEST_JUNIT_OUTPUT_FILE=starci/reports/junit.xml` |
| Java, JUnit 5 | `@DisplayName("[idempotency] cùng khoá trả cùng kết quả")` | `mvn test`, rồi chép `target/surefire-reports/TEST-*.xml` |
| C#, xUnit | `[Fact(DisplayName = "[idempotency] cùng khoá trả cùng kết quả")]` | `dotnet test --logger "junit;LogFilePath=starci/reports/junit.xml"` (gói `JunitXml.TestLogger`) |
| Go | `t.Run("[idempotency] cùng khoá trả cùng kết quả", ...)` | `gotestsum --junitfile starci/reports/junit.xml -- ./...` |

Một test có thể mang nhiều nhãn: `[transactions-and-isolation] [idempotency]`.

## Luồng e2e

`starci/e2e/<concept>.md` là một kịch bản viết tay: chuẩn bị, các bước và điều mong đợi, bằng chứng bạn ghi lại. Mẫu có sẵn cho `request-response-lifecycle`, `health-probe-semantics`, `server-state-cache-lifecycle`, `transactions-and-isolation` và `idempotency`; concept khác bạn tự thêm file cùng tên với id concept.

## CI

Chép mẫu trong `ci/` (theo ngôn ngữ) thành `.github/workflows/starci.yml`. Tạo secret `STARCI_PROJECT_ID` và `STARCI_CI_SECRET` (StarCi hiện giá trị khi bạn gắn repo) và biến `STARCI_API_URL` trong cài đặt repo GitHub. Không bao giờ ghi giá trị secret vào repo. Workflow có quyền `id-token: write` để GitHub chứng thực lần chạy.
