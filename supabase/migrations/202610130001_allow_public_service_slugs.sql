-- Cho phép lưu slug dịch vụ công khai mới mà không phải sửa constraint sau mỗi lần mở rộng danh mục.
-- Migration chỉ thay constraint kiểm tra định dạng; không sửa hoặc xoá dữ liệu hiện có.

alter table public.leads
  drop constraint if exists leads_service_check;

alter table public.leads
  drop constraint if exists leads_service_slug_check;

alter table public.leads
  add constraint leads_service_slug_check
  check (
    char_length(service) between 2 and 80
    and service ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ) not valid;

alter table public.leads
  validate constraint leads_service_slug_check;
