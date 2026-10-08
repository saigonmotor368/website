import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { SupabaseEntities, CaseRecord, CaseItemData, CaseVehicleData, CaseDocumentData } from "@/lib/supabase-entities";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function generateCaseNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `HS-${dateStr}-${random4}`;
}

export async function GET(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const q = url.searchParams.get("q") || undefined;

  try {
    const cases = await SupabaseEntities.getCases({ status, q });
    return NextResponse.json(cases);
  } catch (err) {
    console.warn("Lỗi truy vấn cases từ Supabase:", err);
    return NextResponse.json({ error: "Không thể tải danh sách hồ sơ từ Supabase" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let body: {
    quote_id?: string;
    customer: {
      id?: string;
      name: string;
      phone: string;
      type?: "individual" | "company";
      company_name?: string;
      tax_id?: string;
      zalo_name?: string;
      address?: string;
    };
    vehicles: Array<{
      license_plate?: string;
      owner_name?: string;
      brand?: string;
      model?: string;
      engine_number?: string;
      chassis_number?: string;
      address?: string;
      fleet_description?: string;
      vehicle_count?: number;
    }>;
    services: Array<{
      id?: string;
      name: string;
      price: number;
      quantity: number;
      note?: string;
    }>;
    documents?: Array<{
      name: string;
      status?: "required" | "received" | "missing";
      note?: string;
    }>;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  if (!body.customer?.name || !body.customer?.phone) {
    return NextResponse.json({ error: "Vui lòng nhập tên và số điện thoại khách hàng" }, { status: 400 });
  }

  if (!body.services || body.services.length === 0) {
    return NextResponse.json({ error: "Hồ sơ phải có ít nhất 1 dịch vụ cần xử lý" }, { status: 400 });
  }

  const caseId = crypto.randomUUID(); // Real UUID
  const caseNumber = generateCaseNumber();
  const now = new Date().toISOString();

  const subtotal = body.services.reduce((sum, s) => sum + s.price * (s.quantity || 1), 0);

  const items: CaseItemData[] = body.services.map((s, idx) => ({
    id: crypto.randomUUID(),
    case_id: caseId,
    service_name: s.name,
    quoted_price: s.price,
    adjusted_price: s.price,
    quantity: s.quantity || 1,
    final_price: s.price * (s.quantity || 1),
    sort_order: idx + 1,
  }));

  const vehicles: CaseVehicleData[] = (body.vehicles || []).map((v) => ({
    id: crypto.randomUUID(),
    case_id: caseId,
    license_plate: v.license_plate,
    owner_name: v.owner_name || body.customer.name,
    brand: v.brand,
    model: v.model,
    engine_number: v.engine_number,
    chassis_number: v.chassis_number,
    address: v.address,
    fleet_description: v.fleet_description,
    vehicle_count: v.vehicle_count || 1,
  }));

  const documents: CaseDocumentData[] = (body.documents && body.documents.length > 0)
    ? body.documents.map((d) => ({
        id: crypto.randomUUID(),
        case_id: caseId,
        document_name: d.name,
        status: d.status || "required",
        note: d.note,
      }))
    : [
        {
          id: crypto.randomUUID(),
          case_id: caseId,
          document_name: "Giấy chứng nhận đăng ký xe (Cavet gốc)",
          status: "required",
          note: "Kiểm tra kỹ số khung, số máy thực tế",
        },
        {
          id: crypto.randomUUID(),
          case_id: caseId,
          document_name: "CCCD gắn chip của chủ sở hữu",
          status: "required",
        },
        {
          id: crypto.randomUUID(),
          case_id: caseId,
          document_name: "Hợp đồng ủy quyền / mua bán công chứng",
          status: "required",
        },
      ];

  const newCaseRecord: CaseRecord = {
    id: caseId,
    case_number: caseNumber,
    quote_id: body.quote_id,
    customer: {
      id: body.customer.id || crypto.randomUUID(),
      name: body.customer.name,
      phone: body.customer.phone,
      type: body.customer.type || "individual",
      company_name: body.customer.company_name,
      tax_id: body.customer.tax_id,
      zalo_name: body.customer.zalo_name,
      address: body.customer.address,
      created_at: now,
    },
    vehicles,
    items,
    documents,
    files: [],
    costs: [],
    status: "new",
    received_at: now,
    notes: body.notes,
    estimated_amount: subtotal,
    final_amount: subtotal,
    is_locked: false,
    assigned_to: staff.user.id,
    assigned_name: staff.profile.full_name || staff.user.email,
    created_at: now,
    updated_at: now,
    audit_logs: [
      {
        id: crypto.randomUUID(),
        action: "create_case",
        actor_name: staff.profile.full_name || staff.user.email,
        timestamp: now,
        details: body.quote_id
          ? `Tiếp nhận hồ sơ từ báo giá mã ${body.quote_id}`
          : "Tiếp nhận hồ sơ mới trực tiếp",
      },
    ],
  };

  try {
    // Save directly into Supabase with authenticated staff UUID
    await SupabaseEntities.saveCase(newCaseRecord, { actorId: staff.user.id });
  } catch (saveErr) {
    console.error("Supabase case insertion failed:", saveErr);
    return NextResponse.json(
      { error: "Không thể lưu hồ sơ vào Supabase. Vui lòng thử lại." },
      { status: 500 }
    );
  }

  // Synchronize quote status to accepted across relational column and data snapshot
  if (body.quote_id) {
    try {
      const admin = getSupabaseAdmin();
      const { data: quoteRow } = await admin.from("quotes").select("data").eq("id", body.quote_id).single();
      if (quoteRow) {
        const qData = (quoteRow.data || {}) as Record<string, unknown>;
        qData.status = "accepted";
        qData.case_id = caseId;
        qData.updated_at = now;
        qData.updated_by = staff.user.id;
        await admin.from("quotes").update({
          status: "accepted",
          data: qData,
        }).eq("id", body.quote_id);
      }
    } catch {
      // non-blocking
    }
  }

  return NextResponse.json({
    ok: true,
    case: newCaseRecord,
    caseNumber,
    id: caseId,
  }, { status: 201 });
}
