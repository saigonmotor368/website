# Hướng dẫn Triển khai Saigon Motor (Vercel & Supabase)

## Trạng thái chuẩn bị Go-Live — 08/10/2026

- Mã nguồn đã dùng một luồng quản lý duy nhất tại `/quanly`; các URL `/bao-gia` cũ chỉ chuyển hướng để bảo toàn bookmark.
- Luồng báo giá mới hỗ trợ mở bản nháp, chỉnh sửa, xem trước, phát hành và tải PDF chính thức.
- `lint` và production build đã đạt.
- Tên miền chính dự kiến: `saigonmotor.vn`; hệ thống nội bộ: `quanly.saigonmotor.vn`.
- Thư mục local đã liên kết đúng Vercel Project `sgm11/website`; framework đã sửa từ Vite sang Next.js và output directory đã trả về mặc định của Next.js.
- `saigonmotor.vn` và `www.saigonmotor.vn` đã được thêm vào project nhưng DNS tại vCloudDNS chưa có bản ghi website.
- `quanly.saigonmotor.vn` chưa được thêm vào Vercel Project và chưa có bản ghi DNS.
- Vercel Project hiện chưa có Environment Variables; chưa được deploy mã mới từ nhánh `codex/sgm-production-launch`.
- Production còn cần cấu hình `INTERNAL_AUTH_SECRET`, GTM/GA4 và địa chỉ gửi Resend đã xác minh.
- Phải xoay vòng toàn bộ secret từng được dùng hoặc chia sẻ trong giai đoạn phát triển trước khi mở website.

Tài liệu hướng dẫn triển khai cho website Saigon Motor (Công ty TNHH Ô tô Xe máy 368).

---

## 1. Cơ sở dữ liệu và Phân quyền Supabase (Project ref: `ipsbohgwfenocwsvgeyr`)

### Bước 1.1: Sao lưu dữ liệu hiện có
1. Truy cập Supabase Dashboard -> Project Settings -> Database -> Backups hoặc xuất bảng `quotes` hiện tại ra file JSON/CSV.
2. Bản sao lưu trước đợt nâng cấp hiện tại đã được lưu trữ an toàn tại: `backups/supabase-quotes-before-upgrade-2026-10-07.json` (3 báo giá đang có).

### Bước 1.2: Chạy migration bảo mật
Mở Supabase SQL Editor và thực thi file:
`supabase/migrations/202610070001_secure_leads_and_staff.sql`
- Khởi tạo bảng `staff_profiles` với RLS.
- Khởi tạo bảng `leads` với rate-limiting IP hash index và các trường tracking.
- Khởi tạo bảng `lead_events` để ghi nhận nhật ký xử lý hồ sơ nội bộ.
- Bổ sung audit columns (`created_by`, `updated_by`, `updated_at`) vào bảng `quotes`.
- Thiết lập RLS policies: Active staff có quyền xem và cập nhật; chỉ role `owner` mới được phép xóa báo giá.

### Bước 1.3: Tạo tài khoản Supabase Auth và phân quyền
Vào **Authentication -> Users** trong Supabase Dashboard và mời hoặc tạo 2 tài khoản:
1. **Chủ hệ thống nội bộ**: `saigonmotor68@gmail.com` (Tên: Phạm Xuân Định)
2. **Nhân viên xử lý hồ sơ**: `xuandinh.avg@gmail.com` (Tên: Nguyễn Đình Mẫn)

Lấy UUID của 2 tài khoản vừa tạo từ bảng `auth.users`, sau đó chạy truy vấn SQL:
```sql
insert into public.staff_profiles(user_id, full_name, role) values
  ('UUID_CỦA_PHAM_XUAN_DINH', 'Phạm Xuân Định', 'owner'),
  ('UUID_CỦA_NGUYEN_DINH_MAN', 'Nguyễn Đình Mẫn', 'staff')
on conflict (user_id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  is_active = true,
  updated_at = now();
```

---

## 2. Cấu hình Biến môi trường trên Vercel

Cấu hình các biến sau trong Vercel Project Settings -> **Environment Variables**:

| Tên biến | Môi trường áp dụng | Mục đích |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production & Preview | URL API Supabase client-side |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production & Preview | Anon public key Supabase |
| `SUPABASE_URL` | Production & Preview | URL API Supabase phía server |
| `SUPABASE_SERVICE_ROLE_KEY` | Production & Preview (Server only) | Service-role key vượt RLS trên server |
| `INTERNAL_AUTH_SECRET` | Production & Preview (Server only) | Secret băm SHA-256 IP rate limit và reset token |
| `RESEND_API_KEY` | Production & Preview (Server only) | API Key gửi email thông báo lead mới |
| `LEAD_NOTIFICATION_FROM` | Production & Preview | `Saigon Motor <leads@saigonmotor.vn>` |
| `LEAD_NOTIFICATION_TO` | Production & Preview | `saigonmotor68@gmail.com` |
| `GEMINI_API_KEY` | Production & Preview (Server only) | API key trích xuất dữ liệu cà vẹt xe |
| `NEXT_PUBLIC_GTM_ID` | Production & Preview | Mã Google Tag Manager (vd: `GTM-XXXXXXX`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Production & Preview | Mã đo lường GA4 (vd: `G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_SITE_URL` | Production & Preview | `https://saigonmotor.vn` |

> [!CAUTION]
> Tuyệt đối không đưa `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `GEMINI_API_KEY` hoặc `INTERNAL_AUTH_SECRET` vào các biến có tiền tố `NEXT_PUBLIC_`.

---

## 3. Cấu hình Tên miền và Chuyển hướng (Vercel & DNS)

1. Tên miền chính: **https://saigonmotor.vn**
2. Cấu hình chuyển hướng `www.saigonmotor.vn` về `https://saigonmotor.vn`:
   - Đã được cấu hình tự động trong `next.config.ts` (Permanent redirect 308).
   - Trên Vercel Domains: Khi thêm `saigonmotor.vn`, chọn tự động chuyển hướng `www.saigonmotor.vn` -> `saigonmotor.vn`.
3. Chỉ trỏ DNS bản ghi A / CNAME sang Vercel sau khi hoàn thành nghiệm thu bản Preview.

---

## 4. Kiểm tra Đo lường và Quảng cáo (GTM & GA4)

1. **Consent Mode v2**: Banner cookie trên website tự động cấp quyền `analytics_storage` và `ad_storage` khi khách hàng nhấn "Đồng ý".
2. **Sự kiện chuyển đổi**:
   - `lead_submit_success`: Sự kiện chỉ bắn DUY NHẤT khi API `/api/leads` trả về `leadId` hợp lệ. Đây là sự kiện đặt làm Primary Conversion trên Google Ads.
   - Các tương tác liên hệ nhanh: `call_click`, `zalo_click`, `directions_click`.
   - Các sự kiện nội bộ của nhân viên (`contacted`, `qualified`, `file_received`, `completed`) được lưu độc lập trong `lead_events` phía server, không bắn pixel ảo từ trình duyệt nhân viên.

---

## 5. Checklist Nghiệm thu trước khi Go-Live

- [ ] Chạy migration trên Supabase production (sau khi Codex duyệt).
- [ ] Phân quyền 2 tài khoản `owner` (Phạm Xuân Định) và `staff` (Nguyễn Đình Mẫn).
- [ ] Thử đăng nhập, quên mật khẩu, đặt lại mật khẩu tại `/dang-nhap-noi-bo`.
- [ ] Xác minh tài khoản `staff` không có quyền quản trị danh mục dịch vụ trong `/quanly/services`.
- [ ] Gửi thử 1 lead trên trang chủ: kiểm tra form validation, honeypot, rate limiting, bản ghi trong bảng `leads` và `lead_events`.
- [ ] Kiểm tra màn hình `/quanly/leads`: lọc trạng thái, phân công nhân viên, hiển thị đúng tên nhân viên, cập nhật ghi chú lý do thất bại.
- [ ] Mở một bản nháp tại `/quanly/quotes`, chỉnh giá, lưu lại rồi phát hành và tải PDF chính thức.
- [ ] Thử thao tác nút "Gửi lại email" trong khu vực nội bộ.
- [ ] Xác minh `sitemap.xml`, `robots.txt`, schema LocalBusiness và thẻ `noindex` trên trang `/thank-you`.
- [ ] Xoay vòng các secret tạm thời đã dùng trong giai đoạn phát triển trước khi mở quảng cáo.
