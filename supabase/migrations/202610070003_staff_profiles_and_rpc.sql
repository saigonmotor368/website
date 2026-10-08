-- Migration: 202610070003_staff_profiles_and_rpc.sql
-- Version: 2 (07/10/2026) — Security hardened rewrite
--
-- Thay đổi so với v1:
--   * SET search_path = public, pg_temp  (path cố định, không bị search_path injection)
--   * REVOKE EXECUTE từ public/anon/authenticated, GRANT chỉ cho service_role
--   * rpc_approve_cost xác minh approver phải có role='owner' trong staff_profiles
--   * Tạo khách hàng trong CÙNG transaction với tạo hồ sơ (rpc_create_case)
--   * Unique index canonical phone trên bảng customers
--   * Hàm helper _normalize_phone() với search_path cố định
--   * Xóa GRANT EXECUTE cho PUBLIC trên mọi function

create extension if not exists pgcrypto;

-- quotes.id là text để tiếp tục hỗ trợ các mã báo giá legacy (q_...). Cột
-- updated_at được các API mới dùng nhưng chưa có trong schema quản lý ban đầu.
alter table public.quotes
  add column if not exists updated_at timestamptz not null default now();

-- =============================================================================
-- 1. BẢNG staff_profiles
-- =============================================================================
create table if not exists public.staff_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  role       text not null check (role in ('owner', 'staff')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.staff_profiles (user_id, full_name, role, is_active)
values
  ('d18cc40a-4400-41bf-89ed-6d9d167af747', 'Phạm Xuân Định',  'owner', true),
  ('171531ca-265d-4e13-8dd7-c75627267efe', 'Nguyễn Đình Mẫn', 'staff', true)
on conflict (user_id) do update set
  full_name  = excluded.full_name,
  role       = excluded.role,
  is_active  = excluded.is_active,
  updated_at = now();

alter table public.staff_profiles enable row level security;

drop policy if exists "staff_profiles_select" on public.staff_profiles;
create policy "staff_profiles_select" on public.staff_profiles
  for select to authenticated using (true);

-- =============================================================================
-- 2. HELPER: _normalize_phone + UNIQUE INDEX canonical phone
-- =============================================================================

create or replace function public._normalize_phone(raw text)
returns text
language sql
immutable
strict
set search_path = public, pg_temp
as $$
  select case
    when left(regexp_replace(raw, '[^0-9]', '', 'g'), 2) = '84'
         and length(regexp_replace(raw, '[^0-9]', '', 'g')) >= 10
      then '0' || substring(regexp_replace(raw, '[^0-9]', '', 'g') from 3)
    else regexp_replace(raw, '[^0-9]', '', 'g')
  end;
$$;

revoke all on function public._normalize_phone(text) from public, anon, authenticated;

-- Hợp nhất dữ liệu khách hàng cũ bị trùng số điện thoại trước khi tạo unique
-- index. Giữ bản ghi được tạo sớm nhất và chuyển toàn bộ quan hệ sang bản ghi đó
-- để không làm mất xe, báo giá, hồ sơ hoặc hóa đơn đã có.
do $$
declare
  v_group record;
  v_duplicate_id uuid;
begin
  for v_group in
    select
      public._normalize_phone(phone) as canonical_phone,
      (array_agg(id order by created_at asc, id asc))[1] as keep_id
    from public.customers
    where phone is not null
      and phone <> ''
      and public._normalize_phone(phone) <> ''
    group by public._normalize_phone(phone)
    having count(*) > 1
  loop
    for v_duplicate_id in
      select id
      from public.customers
      where public._normalize_phone(phone) = v_group.canonical_phone
        and id <> v_group.keep_id
    loop
      update public.vehicles
      set customer_id = v_group.keep_id
      where customer_id = v_duplicate_id;

      update public.quotes
      set customer_id = v_group.keep_id
      where customer_id = v_duplicate_id;

      update public.cases
      set customer_id = v_group.keep_id
      where customer_id = v_duplicate_id;

      update public.invoices
      set customer_id = v_group.keep_id
      where customer_id = v_duplicate_id;

      delete from public.customers where id = v_duplicate_id;
    end loop;
  end loop;
end;
$$;

create unique index if not exists customers_canonical_phone_uidx
  on public.customers ( public._normalize_phone(phone) )
  where phone is not null and phone <> '';

-- =============================================================================
-- 3. RPC 1: rpc_create_case
--    Khách hàng + Hồ sơ + Items + Vehicles + Documents trong 1 transaction
-- =============================================================================
drop function if exists public.rpc_create_case(jsonb, jsonb, jsonb, jsonb, jsonb, jsonb);

create function public.rpc_create_case(
  p_case      jsonb,
  p_customer  jsonb   default null,
  p_items     jsonb   default '[]'::jsonb,
  p_vehicles  jsonb   default '[]'::jsonb,
  p_documents jsonb   default '[]'::jsonb,
  p_audit     jsonb   default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_case_id     uuid;
  v_customer_id uuid;
  v_vehicle_id  uuid;
  v_clean_phone text;
  v_vehicle     jsonb;
  v_item        jsonb;
  v_doc         jsonb;
begin
  -- 1. Khách hàng (upsert trong cùng transaction, canonical phone dedup)
  if p_customer is not null and (p_customer->>'phone') is not null then
    v_clean_phone := public._normalize_phone(p_customer->>'phone');

    select id into v_customer_id
    from public.customers
    where public._normalize_phone(phone) = v_clean_phone
       or (
            (p_customer->>'tax_id') is not null
            and trim(p_customer->>'tax_id') <> ''
            and tax_id = trim(p_customer->>'tax_id')
          )
    limit 1;

    if v_customer_id is null then
      v_customer_id := coalesce((p_customer->>'id')::uuid, gen_random_uuid());
      insert into public.customers (
        id, type, name, phone, company_name, tax_id,
        zalo_name, email, address, notes, created_by
      ) values (
        v_customer_id,
        coalesce(p_customer->>'type', 'individual'),
        trim(p_customer->>'name'),
        v_clean_phone,
        nullif(trim(p_customer->>'company_name'), ''),
        nullif(trim(p_customer->>'tax_id'),       ''),
        nullif(trim(p_customer->>'zalo_name'),    ''),
        nullif(trim(p_customer->>'email'),        ''),
        nullif(trim(p_customer->>'address'),      ''),
        nullif(trim(p_customer->>'notes'),        ''),
        (p_case->>'created_by')::uuid
      );
    else
      update public.customers set
        name         = coalesce(nullif(trim(p_customer->>'name'),         ''), name),
        company_name = coalesce(nullif(trim(p_customer->>'company_name'), ''), company_name),
        tax_id       = coalesce(nullif(trim(p_customer->>'tax_id'),       ''), tax_id),
        zalo_name    = coalesce(nullif(trim(p_customer->>'zalo_name'),    ''), zalo_name),
        email        = coalesce(nullif(trim(p_customer->>'email'),        ''), email),
        address      = coalesce(nullif(trim(p_customer->>'address'),      ''), address),
        updated_at   = now()
      where id = v_customer_id;
    end if;
  else
    v_customer_id := (p_case->>'customer_id')::uuid;
  end if;

  -- 2. Hồ sơ (cases)
  v_case_id := coalesce((p_case->>'id')::uuid, gen_random_uuid());

  insert into public.cases (
    id, case_number, customer_id, quote_id, status, assigned_to,
    received_at, notes, estimated_amount, final_amount, is_locked, updated_at
  ) values (
    v_case_id,
    p_case->>'case_number',
    v_customer_id,
    nullif(p_case->>'quote_id', ''),
    coalesce(p_case->>'status', 'new'),
    (p_case->>'assigned_to')::uuid,
    coalesce((p_case->>'received_at')::timestamptz, now()),
    nullif(p_case->>'notes', ''),
    coalesce((p_case->>'estimated_amount')::bigint, 0),
    coalesce((p_case->>'final_amount')::bigint,     0),
    coalesce((p_case->>'is_locked')::boolean,       false),
    now()
  )
  on conflict (id) do update set
    status           = excluded.status,
    assigned_to      = coalesce(excluded.assigned_to, cases.assigned_to),
    notes            = excluded.notes,
    estimated_amount = excluded.estimated_amount,
    final_amount     = excluded.final_amount,
    is_locked        = excluded.is_locked,
    updated_at       = now();

  -- 3. Chi tiết dịch vụ (case_items)
  delete from public.case_items where case_id = v_case_id;
  if jsonb_array_length(p_items) > 0 then
    for v_item in select * from jsonb_array_elements(p_items) loop
      insert into public.case_items (
        id, case_id, service_name, quoted_price, adjusted_price, quantity,
        adjustment_reason, final_price, sort_order
      ) values (
        coalesce((v_item->>'id')::uuid, gen_random_uuid()),
        v_case_id,
        v_item->>'service_name',
        coalesce((v_item->>'quoted_price')::bigint,  0),
        coalesce((v_item->>'adjusted_price')::bigint,0),
        greatest(1, coalesce((v_item->>'quantity')::int, 1)),
        nullif(v_item->>'adjustment_reason', ''),
        coalesce((v_item->>'final_price')::bigint, 0),
        coalesce((v_item->>'sort_order')::int, 0)
      );
    end loop;
  end if;

  -- 4. Phương tiện (vehicles + case_vehicles)
  delete from public.case_vehicles where case_id = v_case_id;
  for v_vehicle in select * from jsonb_array_elements(p_vehicles) loop
    v_vehicle_id := (v_vehicle->>'vehicle_id')::uuid;
    if v_vehicle_id is null
       and ((v_vehicle->>'license_plate') is not null or (v_vehicle->>'brand') is not null)
    then
      v_vehicle_id := gen_random_uuid();
      insert into public.vehicles (
        id, customer_id, license_plate, owner_name, brand, model, engine_number, chassis_number
      ) values (
        v_vehicle_id,
        v_customer_id,
        nullif(upper(trim(v_vehicle->>'license_plate')), ''),
        nullif(trim(v_vehicle->>'owner_name'),   ''),
        nullif(trim(v_vehicle->>'brand'),         ''),
        nullif(trim(v_vehicle->>'model'),         ''),
        nullif(trim(v_vehicle->>'engine_number'), ''),
        nullif(trim(v_vehicle->>'chassis_number'),'')
      );
    end if;
    insert into public.case_vehicles (id, case_id, vehicle_id, fleet_description, vehicle_count)
    values (
      coalesce((v_vehicle->>'id')::uuid, gen_random_uuid()),
      v_case_id,
      v_vehicle_id,
      nullif(v_vehicle->>'fleet_description', ''),
      greatest(1, coalesce((v_vehicle->>'vehicle_count')::int, 1))
    );
  end loop;

  -- 5. Checklist giấy tờ (case_documents)
  delete from public.case_documents where case_id = v_case_id;
  if jsonb_array_length(p_documents) > 0 then
    for v_doc in select * from jsonb_array_elements(p_documents) loop
      insert into public.case_documents (
        id, case_id, document_name, status, note, verified_by, verified_at
      ) values (
        coalesce((v_doc->>'id')::uuid, gen_random_uuid()),
        v_case_id,
        v_doc->>'document_name',
        coalesce(v_doc->>'status', 'required'),
        nullif(v_doc->>'note', ''),
        (v_doc->>'verified_by')::uuid,
        (v_doc->>'verified_at')::timestamptz
      );
    end loop;
  end if;

  -- 6. Đồng bộ trạng thái báo giá
  if (p_case->>'quote_id') is not null and trim(p_case->>'quote_id') <> '' then
    update public.quotes
    set status = 'accepted', updated_at = now()
    where id = p_case->>'quote_id';
  end if;

  -- 7. Audit log
  if p_audit is not null then
    insert into public.audit_logs (id, actor_id, action, entity_type, entity_id, new_data, created_at)
    values (
      coalesce((p_audit->>'id')::uuid, gen_random_uuid()),
      (p_audit->>'actor_id')::uuid,
      coalesce(p_audit->>'action', 'create_case'),
      'case',
      v_case_id::text,
      p_audit->'new_data',
      now()
    );
  end if;

  return jsonb_build_object(
    'id',          v_case_id,
    'case_number', p_case->>'case_number',
    'customer_id', v_customer_id,
    'status',      coalesce(p_case->>'status', 'new')
  );
end;
$$;

revoke all on function public.rpc_create_case(jsonb, jsonb, jsonb, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.rpc_create_case(jsonb, jsonb, jsonb, jsonb, jsonb, jsonb)
  to service_role;

-- =============================================================================
-- 4. RPC 2: rpc_create_invoice
-- =============================================================================
drop function if exists public.rpc_create_invoice(jsonb, jsonb, jsonb, jsonb, jsonb);

create function public.rpc_create_invoice(
  p_invoice  jsonb,
  p_customer jsonb default null,
  p_items    jsonb default '[]'::jsonb,
  p_payment  jsonb default null,
  p_audit    jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice_id  uuid;
  v_customer_id uuid;
  v_item        jsonb;
begin
  v_invoice_id  := coalesce((p_invoice->>'id')::uuid, gen_random_uuid());
  v_customer_id := (p_invoice->>'customer_id')::uuid;

  insert into public.invoices (
    id, invoice_number, case_id, customer_id, status,
    issued_at, due_date, total_amount, notes, created_by, updated_at
  ) values (
    v_invoice_id,
    p_invoice->>'invoice_number',
    nullif(p_invoice->>'case_id', '')::uuid,
    v_customer_id,
    coalesce(p_invoice->>'status', 'issued'),
    coalesce((p_invoice->>'issued_at')::timestamptz, now()),
    (p_invoice->>'due_date')::timestamptz,
    coalesce((p_invoice->>'total_amount')::bigint, 0),
    nullif(p_invoice->>'notes', ''),
    (p_invoice->>'created_by')::uuid,
    now()
  )
  on conflict (id) do update set
    status       = excluded.status,
    total_amount = excluded.total_amount,
    notes        = excluded.notes,
    updated_at   = now();

  delete from public.invoice_items where invoice_id = v_invoice_id;
  if jsonb_array_length(p_items) > 0 then
    for v_item in select * from jsonb_array_elements(p_items) loop
      insert into public.invoice_items (id, invoice_id, item_name, unit_price, quantity, total_price)
      values (
        coalesce((v_item->>'id')::uuid, gen_random_uuid()),
        v_invoice_id,
        v_item->>'item_name',
        coalesce((v_item->>'unit_price')::bigint, 0),
        greatest(1, coalesce((v_item->>'quantity')::int, 1)),
        coalesce((v_item->>'total_price')::bigint, 0)
      );
    end loop;
  end if;

  if p_payment is not null and coalesce((p_payment->>'amount')::bigint, 0) > 0 then
    insert into public.payments (
      id, invoice_id, payment_date, amount, payment_method, reference_code, notes, recorded_by
    ) values (
      coalesce((p_payment->>'id')::uuid, gen_random_uuid()),
      v_invoice_id,
      coalesce((p_payment->>'payment_date')::timestamptz, now()),
      (p_payment->>'amount')::bigint,
      coalesce(p_payment->>'payment_method', 'bank_transfer'),
      nullif(p_payment->>'reference_code', ''),
      nullif(p_payment->>'notes',          ''),
      (p_payment->>'recorded_by')::uuid
    );
  end if;

  if p_audit is not null then
    insert into public.audit_logs (id, actor_id, action, entity_type, entity_id, new_data, created_at)
    values (
      coalesce((p_audit->>'id')::uuid, gen_random_uuid()),
      (p_audit->>'actor_id')::uuid,
      coalesce(p_audit->>'action', 'create_invoice'),
      'invoice',
      v_invoice_id::text,
      p_audit->'new_data',
      now()
    );
  end if;

  return jsonb_build_object(
    'id',             v_invoice_id,
    'invoice_number', p_invoice->>'invoice_number',
    'status',         coalesce(p_invoice->>'status', 'issued')
  );
end;
$$;

revoke all on function public.rpc_create_invoice(jsonb, jsonb, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.rpc_create_invoice(jsonb, jsonb, jsonb, jsonb, jsonb)
  to service_role;

-- =============================================================================
-- 5. RPC 3: rpc_record_payment
-- =============================================================================
drop function if exists public.rpc_record_payment(jsonb, jsonb);

create function public.rpc_record_payment(
  p_payment jsonb,
  p_audit   jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment_id uuid;
begin
  v_payment_id := coalesce((p_payment->>'id')::uuid, gen_random_uuid());

  insert into public.payments (
    id, invoice_id, payment_date, amount, payment_method, reference_code, notes, recorded_by
  ) values (
    v_payment_id,
    (p_payment->>'invoice_id')::uuid,
    coalesce((p_payment->>'payment_date')::timestamptz, now()),
    (p_payment->>'amount')::bigint,
    coalesce(p_payment->>'payment_method', 'bank_transfer'),
    nullif(p_payment->>'reference_code', ''),
    nullif(p_payment->>'notes',          ''),
    (p_payment->>'recorded_by')::uuid
  );

  if p_audit is not null then
    insert into public.audit_logs (id, actor_id, action, entity_type, entity_id, new_data, created_at)
    values (
      coalesce((p_audit->>'id')::uuid, gen_random_uuid()),
      (p_audit->>'actor_id')::uuid,
      coalesce(p_audit->>'action', 'record_payment'),
      'payment',
      v_payment_id::text,
      p_audit->'new_data',
      now()
    );
  end if;

  return jsonb_build_object('id', v_payment_id, 'amount', p_payment->>'amount');
end;
$$;

revoke all on function public.rpc_record_payment(jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.rpc_record_payment(jsonb, jsonb)
  to service_role;

-- =============================================================================
-- 6. RPC 4: rpc_approve_cost — xác minh approver là owner trong staff_profiles
-- =============================================================================
drop function if exists public.rpc_approve_cost(uuid, uuid, text);

create function public.rpc_approve_cost(
  p_cost_id       uuid,
  p_approver_id   uuid,
  p_approver_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_case_id uuid;
  v_amount  bigint;
  v_role    text;
begin
  -- Bắt buộc approver phải có role='owner' trong staff_profiles
  select role into v_role
  from public.staff_profiles
  where user_id = p_approver_id and is_active = true;

  if v_role is null then
    raise exception 'APPROVER_NOT_FOUND: UUID % không tồn tại trong staff_profiles hoặc tài khoản bị vô hiệu hóa', p_approver_id
      using errcode = 'P0001';
  end if;

  if v_role <> 'owner' then
    raise exception 'APPROVER_NOT_OWNER: UUID % có role=''%'', chỉ owner được phép duyệt chi phí', p_approver_id, v_role
      using errcode = 'P0002';
  end if;

  update public.case_costs
  set status      = 'approved',
      approved_by = p_approver_id,
      approved_at = now()
  where id = p_cost_id
  returning case_id, amount into v_case_id, v_amount;

  if not found then
    raise exception 'COST_NOT_FOUND: Không tìm thấy chi phí với id = %', p_cost_id
      using errcode = 'P0003';
  end if;

  insert into public.audit_logs (id, actor_id, action, entity_type, entity_id, new_data, created_at)
  values (
    gen_random_uuid(),
    p_approver_id,
    'approve_case_cost',
    'case_cost',
    p_cost_id::text,
    jsonb_build_object(
      'cost_id',    p_cost_id,
      'case_id',    v_case_id,
      'amount',     v_amount,
      'actor_name', coalesce(p_approver_name, 'Chủ hệ thống')
    ),
    now()
  );

  return jsonb_build_object('id', p_cost_id, 'status', 'approved');
end;
$$;

revoke all on function public.rpc_approve_cost(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.rpc_approve_cost(uuid, uuid, text)
  to service_role;

-- =============================================================================
-- 7. GRANT _normalize_phone cho service_role (dùng để gọi nội bộ qua SDK)
-- =============================================================================
grant execute on function public._normalize_phone(text) to service_role;
