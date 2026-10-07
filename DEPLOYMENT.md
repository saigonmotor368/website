# Triển khai Saigon Motor

## 1. Sao lưu và nâng cấp Supabase

1. Tạo bản sao lưu dự án Supabase đang lưu báo giá.
2. Chạy migration `supabase/migrations/202610070001_secure_leads_and_staff.sql` bằng SQL Editor.
3. Trong Supabase Authentication, tạo hai người dùng bằng email riêng: chủ doanh nghiệp và nhân viên hồ sơ.
4. Lấy UUID của hai người dùng và chạy hai lệnh `insert` mẫu ở cuối file migration để cấp vai trò `owner` và `staff`.
5. Không đưa `SUPABASE_SERVICE_ROLE_KEY` ra trình duyệt hoặc biến môi trường có tiền tố `NEXT_PUBLIC_`.

## 2. Biến môi trường

Sao chép danh sách trong `.env.example` sang Vercel. Các giá trị bắt buộc trước khi chạy thật:

- Supabase URL, anon key và service-role key.
- Resend API key và địa chỉ gửi đã xác minh trên `saigonmotor.vn`.
- `LEAD_NOTIFICATION_TO=saigommotor68@gmail.com`.
- GTM container ID sau khi cấu hình GA4 và Google Ads.

## 3. Đo lường

Trong GTM, tạo trigger theo các sự kiện `call_click`, `zalo_click`, `messenger_click`, `directions_click` và `lead_submit_success`. Chỉ đặt conversion Google Ads cho `lead_submit_success`; các trạng thái `qualified`, `file_received` và `completed` được ghi trong bảng `lead_events` để đối soát và nhập conversion ngoại tuyến.

## 4. Kiểm tra trước khi mở quảng cáo

- Đăng nhập được bằng cả hai tài khoản; nhân viên không thể xoá báo giá.
- Gửi một lead thử, kiểm tra hàng dữ liệu trong `leads`, bản ghi `lead_events` và email thông báo.
- Chuyển lead qua đủ các trạng thái trong `/bao-gia/leads`.
- Kiểm tra `sitemap.xml`, `robots.txt`, canonical và Consent Mode bằng Tag Assistant.
- Cập nhật website và địa chỉ phường Hiệp Bình trên Google Business Profile.
- Chỉ trỏ `saigonmotor.vn` sang Vercel sau khi các mục trên đạt yêu cầu.
