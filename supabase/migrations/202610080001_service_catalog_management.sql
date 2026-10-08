-- Quản lý danh mục dịch vụ: giá vốn, giá bán và lịch sử cập nhật.
alter table public.service_catalog
  add column if not exists cost_price bigint not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table public.service_catalog
  drop constraint if exists service_catalog_cost_price_nonnegative,
  drop constraint if exists service_catalog_suggested_price_nonnegative;

alter table public.service_catalog
  add constraint service_catalog_cost_price_nonnegative check (cost_price >= 0),
  add constraint service_catalog_suggested_price_nonnegative check (suggested_price >= 0);

insert into public.service_catalog
  (code, group_name, name, vehicle_type, cost_price, suggested_price, sort_order, is_active)
values
  ('S1_MB', 'Nhóm 1: Thu hồi đăng ký & biển số', 'Thu hồi đăng ký & biển số (Xe máy)', 'motorbike', 1100000, 1500000, 1, true),
  ('S1_CAR', 'Nhóm 1: Thu hồi đăng ký & biển số', 'Thu hồi đăng ký & biển số (Ô tô)', 'car', 1500000, 2500000, 2, true),
  ('S2_SAME_MB', 'Nhóm 2: Sang tên đổi chủ', 'Sang tên đổi chủ cùng tỉnh (Xe máy)', 'motorbike', 1100000, 2500000, 3, true),
  ('S2_SAME_CAR', 'Nhóm 2: Sang tên đổi chủ', 'Sang tên đổi chủ cùng tỉnh (Ô tô)', 'car', 2300000, 5000000, 4, true),
  ('S2_DIFF_MB', 'Nhóm 2: Sang tên đổi chủ', 'Sang tên đổi chủ chuyển tỉnh (Xe máy)', 'motorbike', 1100000, 2800000, 5, true),
  ('S2_DIFF_CAR', 'Nhóm 2: Sang tên đổi chủ', 'Sang tên đổi chủ chuyển tỉnh (Ô tô)', 'car', 2300000, 5500000, 6, true),
  ('S3_RENEW_CAVET', 'Nhóm 3: Cấp đổi, cấp lại giấy tờ', 'Cấp đổi/Cấp lại cà-vẹt bị mất, rách hoặc hỏng', 'all', 0, 1200000, 7, true),
  ('S3_RENEW_PLATE', 'Nhóm 3: Cấp đổi, cấp lại giấy tờ', 'Cấp đổi/Cấp lại biển số xe', 'all', 0, 1000000, 8, true),
  ('S4_YELLOW_PLATE', 'Nhóm 4: Dịch vụ xe kinh doanh', 'Đổi sang biển số vàng cho xe kinh doanh vận tải', 'car', 0, 1800000, 9, true),
  ('S4_INSPECTION', 'Nhóm 4: Dịch vụ xe kinh doanh', 'Hỗ trợ đăng kiểm và làm phù hiệu vận tải', 'car', 0, 2000000, 10, true),
  ('S5_OTHER', 'Nhóm 5: Dịch vụ pháp lý khác', 'Tư vấn, xử lý hồ sơ xe theo yêu cầu', 'all', 0, 1000000, 11, true)
on conflict (code) do update set
  group_name = excluded.group_name,
  name = excluded.name,
  vehicle_type = excluded.vehicle_type,
  suggested_price = excluded.suggested_price,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();
