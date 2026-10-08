import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { defaultServices } from "@/lib/service-catalog-defaults";
import { serviceDocuments } from "@/lib/service-document-defaults";

type CatalogInput = {
  id?: string;
  code?: string;
  group_name?: string;
  name?: string;
  vehicle_type?: "car" | "motorbike" | "all";
  cost_price?: number;
  suggested_price?: number;
  sort_order?: number;
};

function validateInput(body: CatalogInput) {
  const code = (body.code || "").trim().toUpperCase().replace(/\s+/g, "_");
  const groupName = (body.group_name || "").trim();
  const name = (body.name || "").trim();
  const vehicleType = body.vehicle_type || "all";
  const costPrice = Number(body.cost_price || 0);
  const suggestedPrice = Number(body.suggested_price || 0);
  const sortOrder = Number(body.sort_order || 0);

  if (!code || !groupName || !name) return { error: "Vui lòng nhập đầy đủ mã, nhóm và tên dịch vụ." };
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) return { error: "Mã dịch vụ chỉ gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới." };
  if (!["car", "motorbike", "all"].includes(vehicleType)) return { error: "Loại xe không hợp lệ." };
  if (![costPrice, suggestedPrice, sortOrder].every(Number.isFinite) || costPrice < 0 || suggestedPrice < 0 || sortOrder < 0) {
    return { error: "Giá và thứ tự phải là số không âm." };
  }

  return {
    value: {
      code,
      group_name: groupName,
      name,
      vehicle_type: vehicleType,
      cost_price: Math.round(costPrice),
      suggested_price: Math.round(suggestedPrice),
      sort_order: Math.round(sortOrder),
      is_active: true,
      updated_at: new Date().toISOString(),
    },
  };
}

async function audit(actorId: string, action: string, entityId: string, oldData: unknown, newData: unknown) {
  await getSupabaseAdmin().from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: "service_catalog",
    entity_id: entityId,
    old_data: oldData,
    new_data: newData,
  });
}

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { data: catalog, error } = await getSupabaseAdmin()
    .from("service_catalog")
    .select("id, code, group_name, name, vehicle_type, cost_price, suggested_price, is_active, sort_order, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!error && catalog && catalog.length > 0) {
    return NextResponse.json({ services: catalog, templates: serviceDocuments, canManage: staff.profile.role === "owner" });
  }

  const fallbackServices = defaultServices.flatMap((group, groupIndex) =>
    group.services.map((service, serviceIndex) => ({
      id: service.id,
      code: service.id.toUpperCase(),
      group_name: group.group,
      name: service.name,
      vehicle_type: service.vehicleType,
      cost_price: 0,
      suggested_price: service.price,
      sort_order: groupIndex * 20 + serviceIndex + 1,
      isFallback: true,
    }))
  );

  return NextResponse.json({
    services: fallbackServices,
    templates: serviceDocuments,
    canManage: staff.profile.role === "owner",
    warning: error ? "Danh mục Supabase chưa được nâng cấp." : "Danh mục Supabase đang trống.",
  });
}

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (staff.profile.role !== "owner") return NextResponse.json({ error: "Chỉ chủ hệ thống được thêm dịch vụ." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as CatalogInput | null;
  if (!body) return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  const validated = validateInput(body);
  if (validated.error || !validated.value) return NextResponse.json({ error: validated.error }, { status: 400 });

  const { data, error } = await getSupabaseAdmin().from("service_catalog").insert(validated.value).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Mã dịch vụ đã tồn tại." : error.message }, { status: 400 });
  await audit(staff.user.id, "service_created", data.id, null, data);
  return NextResponse.json({ ok: true, service: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (staff.profile.role !== "owner") return NextResponse.json({ error: "Chỉ chủ hệ thống được sửa dịch vụ." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as CatalogInput | null;
  if (!body?.id) return NextResponse.json({ error: "Thiếu mã định danh dịch vụ." }, { status: 400 });
  const validated = validateInput(body);
  if (validated.error || !validated.value) return NextResponse.json({ error: validated.error }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data: oldData } = await admin.from("service_catalog").select("*").eq("id", body.id).maybeSingle();
  if (!oldData) return NextResponse.json({ error: "Không tìm thấy dịch vụ." }, { status: 404 });
  const { data, error } = await admin.from("service_catalog").update(validated.value).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Mã dịch vụ đã tồn tại." : error.message }, { status: 400 });
  await audit(staff.user.id, "service_updated", body.id, oldData, data);
  return NextResponse.json({ ok: true, service: data });
}

export async function DELETE(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (staff.profile.role !== "owner") return NextResponse.json({ error: "Chỉ chủ hệ thống được xóa dịch vụ." }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu mã định danh dịch vụ." }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data: oldData } = await admin.from("service_catalog").select("*").eq("id", id).maybeSingle();
  if (!oldData) return NextResponse.json({ error: "Không tìm thấy dịch vụ." }, { status: 404 });
  const { error } = await admin.from("service_catalog").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(staff.user.id, "service_archived", id, oldData, { ...oldData, is_active: false });
  return NextResponse.json({ ok: true });
}
