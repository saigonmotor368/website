import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { SupabaseEntities } from "@/lib/supabase-entities";

export async function GET(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer_id") || undefined;
  const plate = url.searchParams.get("plate") || undefined;

  try {
    const list = await SupabaseEntities.getVehicles({ customerId, plate, limit: 50 });
    return NextResponse.json(list);
  } catch (err) {
    console.error("Lỗi truy vấn danh sách phương tiện:", err);
    return NextResponse.json({ error: "Không thể tải danh sách phương tiện từ Supabase" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let body: {
    id?: string;
    customer_id?: string;
    vehicle_type?: "car" | "motorbike" | "other";
    license_plate?: string;
    owner_name?: string;
    chassis_number?: string;
    engine_number?: string;
    brand?: string;
    model?: string;
    color?: string;
    manufacturing_year?: number;
    registered_province?: string;
    free_description?: string;
    raw_ai_data?: Record<string, unknown>;
    ai_confidence?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  try {
    const vehicle = await SupabaseEntities.saveVehicle({
      id: body.id,
      customer_id: body.customer_id,
      vehicle_type: body.vehicle_type || "car",
      license_plate: body.license_plate?.trim().toUpperCase(),
      owner_name: body.owner_name?.trim(),
      chassis_number: body.chassis_number?.trim(),
      engine_number: body.engine_number?.trim(),
      brand: body.brand?.trim(),
      model: body.model?.trim(),
      color: body.color?.trim(),
      manufacturing_year: body.manufacturing_year,
      registered_province: body.registered_province?.trim(),
      free_description: body.free_description?.trim(),
      raw_ai_data: body.raw_ai_data,
      ai_confidence: body.ai_confidence,
    });

    return NextResponse.json({ ok: true, vehicle }, { status: 201 });
  } catch (err) {
    console.error("Lỗi lưu phương tiện vào Supabase:", err);
    return NextResponse.json({ error: "Không thể lưu phương tiện vào Supabase." }, { status: 500 });
  }
}
