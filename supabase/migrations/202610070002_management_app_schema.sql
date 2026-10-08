-- Migration: 202610070002_management_app_schema.sql
-- Mục đích: Khởi tạo mô hình quan hệ hoàn chỉnh cho Webapp Quản lý Saigon Motor
-- An toàn: Idempotent, không xóa dữ liệu, bảo toàn cột quotes.data và 3 báo giá cũ.
-- LƯU Ý: Không tự ý chạy trên production Supabase nếu chưa được Codex/Chủ dự án duyệt.

create extension if not exists pgcrypto;

-- 1. Bảng khách hàng (Customers)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'individual' check (type in ('individual', 'company')),
  name text not null,
  company_name text,
  phone text not null,
  zalo_name text,
  email text,
  tax_id text,
  address text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_phone_idx on public.customers(phone);
create index if not exists customers_tax_id_idx on public.customers(tax_id);
create index if not exists customers_company_name_idx on public.customers(company_name);
create index if not exists customers_created_at_idx on public.customers(created_at desc);

-- 2. Bảng phương tiện (Vehicles)
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  vehicle_type text not null default 'car' check (vehicle_type in ('car', 'motorbike', 'other')),
  license_plate text,
  owner_name text,
  chassis_number text,
  engine_number text,
  brand text,
  model text,
  color text,
  manufacturing_year int,
  registered_province text,
  free_description text,
  raw_ai_data jsonb,
  ai_confidence numeric(4,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicles_customer_id_idx on public.vehicles(customer_id);
create index if not exists vehicles_license_plate_idx on public.vehicles(license_plate);

-- 3. Danh mục dịch vụ chuẩn (Service Catalog)
create table if not exists public.service_catalog (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  group_name text not null,
  name text not null,
  vehicle_type text not null default 'all' check (vehicle_type in ('car', 'motorbike', 'all')),
  suggested_price bigint not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists service_catalog_active_idx on public.service_catalog(is_active, sort_order);

-- 4. Mẫu danh mục giấy tờ yêu cầu (Document Templates)
create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.service_catalog(id) on delete cascade,
  document_name text not null,
  default_quantity int not null default 1,
  note text,
  legal_reference text,
  version int not null default 1,
  effective_date date default current_date,
  created_at timestamptz not null default now()
);

create index if not exists document_templates_service_idx on public.document_templates(service_id);

-- 5. Mở rộng bảng Báo giá (Quotes) - Thêm các cột quan hệ, giữ nguyên quotes.data
alter table if exists public.quotes add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table if exists public.quotes add column if not exists status text default 'draft' check (status in ('draft', 'issued', 'accepted', 'rejected', 'expired'));
alter table if exists public.quotes add column if not exists quote_number text;
alter table if exists public.quotes add column if not exists issued_at timestamptz;
alter table if exists public.quotes add column if not exists expires_at timestamptz;
alter table if exists public.quotes add column if not exists total_amount bigint default 0;
alter table if exists public.quotes add column if not exists customer_snapshot jsonb;
alter table if exists public.quotes add column if not exists revision int default 1;
alter table if exists public.quotes add column if not exists notes text;

create index if not exists quotes_status_idx on public.quotes(status);
create index if not exists quotes_customer_id_idx on public.quotes(customer_id);
create index if not exists quotes_quote_number_idx on public.quotes(quote_number);

-- 6. Chi tiết dòng báo giá (Quote Items)
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id text references public.quotes(id) on delete cascade,
  service_id uuid references public.service_catalog(id) on delete set null,
  service_name text not null,
  unit_price bigint not null default 0,
  quantity int not null default 1,
  total_price bigint not null default 0,
  note text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create index if not exists quote_items_quote_idx on public.quote_items(quote_id);

-- 7. Phương tiện trong báo giá (Quote Vehicles)
create table if not exists public.quote_vehicles (
  id uuid primary key default gen_random_uuid(),
  quote_id text references public.quotes(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  vehicle_description text,
  quantity int default 1,
  created_at timestamptz not null default now()
);

create index if not exists quote_vehicles_quote_idx on public.quote_vehicles(quote_id);

-- 8. Giấy tờ snapshot trong báo giá (Quote Documents)
create table if not exists public.quote_documents (
  id uuid primary key default gen_random_uuid(),
  quote_id text references public.quotes(id) on delete cascade,
  document_name text not null,
  quantity int default 1,
  note text,
  is_approved boolean default true,
  created_at timestamptz not null default now()
);

create index if not exists quote_documents_quote_idx on public.quote_documents(quote_id);

-- 9. Hồ sơ thực hiện (Cases)
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text unique not null,
  customer_id uuid references public.customers(id) on delete set null,
  quote_id text references public.quotes(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'processing', 'completed')),
  assigned_to uuid references auth.users(id) on delete set null,
  received_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  estimated_amount bigint not null default 0,
  final_amount bigint not null default 0,
  is_locked boolean not null default false,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cases_status_idx on public.cases(status);
create index if not exists cases_customer_idx on public.cases(customer_id);
create index if not exists cases_assigned_idx on public.cases(assigned_to);
create index if not exists cases_created_idx on public.cases(created_at desc);

-- 10. Dòng dịch vụ hồ sơ (Case Items - theo dõi giá gốc vs giá điều chỉnh)
create table if not exists public.case_items (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  service_name text not null,
  quoted_price bigint not null default 0,
  adjusted_price bigint not null default 0,
  quantity int not null default 1,
  adjustment_reason text,
  final_price bigint not null default 0,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create index if not exists case_items_case_idx on public.case_items(case_id);

-- 11. Phương tiện trong hồ sơ (Case Vehicles)
create table if not exists public.case_vehicles (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  fleet_description text,
  vehicle_count int default 1,
  created_at timestamptz not null default now()
);

create index if not exists case_vehicles_case_idx on public.case_vehicles(case_id);

-- 12. Checklist giấy tờ hồ sơ (Case Documents)
create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  document_name text not null,
  status text not null default 'required' check (status in ('required', 'received', 'missing')),
  note text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists case_documents_case_idx on public.case_documents(case_id);

-- 13. File & ảnh giấy tờ bảo mật (Case Files)
create table if not exists public.case_files (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  storage_path text not null,
  file_type text not null,
  file_size bigint not null default 0,
  file_hash text,
  uploaded_by uuid references auth.users(id) on delete set null,
  ocr_result jsonb,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists case_files_case_idx on public.case_files(case_id);

-- 14. Phiếu thanh toán / Biên nhận dịch vụ (Invoices)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  case_id uuid references public.cases(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'issued', 'cancelled')),
  issued_at timestamptz,
  due_date timestamptz,
  total_amount bigint not null default 0,
  billing_snapshot jsonb,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_case_idx on public.invoices(case_id);
create index if not exists invoices_customer_idx on public.invoices(customer_id);
create index if not exists invoices_status_idx on public.invoices(status);

-- 15. Chi tiết phiếu thanh toán (Invoice Items)
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  item_name text not null,
  unit_price bigint not null default 0,
  quantity int not null default 1,
  total_price bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists invoice_items_invoice_idx on public.invoice_items(invoice_id);

-- 16. Lịch sử thanh toán thực tế (Payments)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  payment_date timestamptz not null default now(),
  amount bigint not null default 0,
  payment_method text not null default 'bank_transfer' check (payment_method in ('cash', 'bank_transfer', 'other')),
  reference_code text,
  notes text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists payments_invoice_idx on public.payments(invoice_id);

-- 17. Chi phí phát sinh theo hồ sơ (Case Costs)
create table if not exists public.case_costs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  cost_group text not null,
  description text not null,
  amount bigint not null default 0,
  incurred_date date not null default current_date,
  receipt_url text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  submitted_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists case_costs_case_idx on public.case_costs(case_id);
create index if not exists case_costs_status_idx on public.case_costs(status);

-- 18. Phân chia lợi nhuận hồ sơ (Profit Allocations - 50/50 mặc định hoặc cấu hình)
create table if not exists public.profit_allocations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  beneficiary_id uuid references auth.users(id) on delete set null,
  beneficiary_name text not null,
  percentage numeric(5,2) not null default 50.00,
  allocated_amount bigint not null default 0,
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists profit_allocations_case_idx on public.profit_allocations(case_id);

-- 19. Nhật ký thao tác hệ thống (Audit Logs)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

-- 20. Hàm sinh mã nghiệp vụ giao dịch (Sequence Generators)
create or replace function public.generate_quote_number()
returns text as $$
declare
  prefix text;
  seq_num int;
begin
  prefix := 'BG-' || to_char(current_date, 'YYYYMMDD') || '-';
  select coalesce(count(*), 0) + 1 into seq_num
  from public.quotes
  where quote_number like prefix || '%';
  return prefix || lpad(seq_num::text, 4, '0');
end;
$$ language plpgsql volatile;

create or replace function public.generate_case_number()
returns text as $$
declare
  prefix text;
  seq_num int;
begin
  prefix := 'HS-' || to_char(current_date, 'YYYYMMDD') || '-';
  select coalesce(count(*), 0) + 1 into seq_num
  from public.cases
  where case_number like prefix || '%';
  return prefix || lpad(seq_num::text, 4, '0');
end;
$$ language plpgsql volatile;

create or replace function public.generate_invoice_number()
returns text as $$
declare
  prefix text;
  seq_num int;
begin
  prefix := 'PT-' || to_char(current_date, 'YYYYMMDD') || '-';
  select coalesce(count(*), 0) + 1 into seq_num
  from public.invoices
  where invoice_number like prefix || '%';
  return prefix || lpad(seq_num::text, 4, '0');
end;
$$ language plpgsql volatile;

-- 21. Bật RLS và phân quyền cho các bảng mới
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.service_catalog enable row level security;
alter table public.document_templates enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_vehicles enable row level security;
alter table public.quote_documents enable row level security;
alter table public.cases enable row level security;
alter table public.case_items enable row level security;
alter table public.case_vehicles enable row level security;
alter table public.case_documents enable row level security;
alter table public.case_files enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.case_costs enable row level security;
alter table public.profit_allocations enable row level security;
alter table public.audit_logs enable row level security;

-- Policies: Nhân sự hoạt động được xem và thao tác dữ liệu cơ bản
create policy "Active staff can manage customers" on public.customers for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage vehicles" on public.vehicles for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can read service catalog" on public.service_catalog for select to authenticated using (true);
create policy "Active staff can read doc templates" on public.document_templates for select to authenticated using (true);
create policy "Active staff can manage quote items" on public.quote_items for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage quote vehicles" on public.quote_vehicles for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage quote docs" on public.quote_documents for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));

create policy "Active staff can manage cases" on public.cases for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage case items" on public.case_items for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage case vehicles" on public.case_vehicles for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage case docs" on public.case_documents for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage case files" on public.case_files for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));

create policy "Active staff can manage invoices" on public.invoices for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage invoice items" on public.invoice_items for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can manage payments" on public.payments for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can read and draft costs" on public.case_costs for select to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can insert costs" on public.case_costs for insert to authenticated with check (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Owner can approve and manage costs" on public.case_costs for update to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true and s.role='owner'));

create policy "Active staff can read profit allocations" on public.profit_allocations for select to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Owner can manage profit allocations" on public.profit_allocations for all to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true and s.role='owner'));
create policy "Active staff can insert audit logs" on public.audit_logs for insert to authenticated with check (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));
create policy "Active staff can read audit logs" on public.audit_logs for select to authenticated using (exists(select 1 from public.staff_profiles s where s.user_id=auth.uid() and s.is_active=true));

-- 22. Dữ liệu hạt giống khởi tạo (Seed Data: Danh mục dịch vụ và Giấy tờ mẫu)
insert into public.service_catalog (code, group_name, name, vehicle_type, suggested_price, sort_order)
values
  ('S1_MB', 'Nhóm 1: Thu hồi đăng ký & biển số', 'Thu hồi đăng ký & biển số (Xe máy)', 'motorbike', 500000, 1),
  ('S1_CAR', 'Nhóm 1: Thu hồi đăng ký & biển số', 'Thu hồi đăng ký & biển số (Ô tô)', 'car', 1500000, 2),
  ('S2_SAME_MB', 'Nhóm 2: Sang tên đổi chủ', 'Sang tên đổi chủ cùng tỉnh (Xe máy)', 'motorbike', 1500000, 3),
  ('S2_SAME_CAR', 'Nhóm 2: Sang tên đổi chủ', 'Sang tên đổi chủ cùng tỉnh (Ô tô)', 'car', 4500000, 4),
  ('S2_DIFF_MB', 'Nhóm 2: Sang tên đổi chủ', 'Sang tên đổi chủ chuyển tỉnh (Xe máy)', 'motorbike', 2500000, 5),
  ('S2_DIFF_CAR', 'Nhóm 2: Sang tên đổi chủ', 'Sang tên đổi chủ chuyển tỉnh (Ô tô)', 'car', 6500000, 6),
  ('S3_RENEW_CAVET', 'Nhóm 3: Cấp đổi, cấp lại giấy tờ', 'Cấp đổi/Cấp lại Cà-vẹt bị mất/rách/hỏng', 'all', 1200000, 7),
  ('S3_RENEW_PLATE', 'Nhóm 3: Cấp đổi, cấp lại giấy tờ', 'Cấp đổi/Cấp lại Biển số xe', 'all', 1000000, 8),
  ('S4_YELLOW_PLATE', 'Nhóm 4: Dịch vụ xe kinh doanh', 'Đổi sang biển số vàng (Xe kinh doanh vận tải)', 'car', 1800000, 9),
  ('S4_INSPECTION', 'Nhóm 4: Dịch vụ xe kinh doanh', 'Hỗ trợ đăng kiểm & làm phù hiệu vận tải', 'car', 2000000, 10),
  ('S5_OTHER', 'Nhóm 5: Dịch vụ pháp lý khác', 'Tư vấn pháp lý hồ sơ xe theo yêu cầu', 'all', 1000000, 11)
on conflict (code) do update set
  suggested_price = excluded.suggested_price,
  name = excluded.name;
