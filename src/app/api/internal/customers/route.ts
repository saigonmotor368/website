import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { SupabaseEntities } from "@/lib/supabase-entities";

export async function GET(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const phone = (url.searchParams.get("phone") || "").trim();

  try {
    const customers = await SupabaseEntities.getCustomers({ q, phone, limit: 50 });
    return NextResponse.json(customers);
  } catch (err) {
    console.error("Lỗi truy vấn danh sách khách hàng:", err);
    return NextResponse.json({ error: "Không thể tải danh sách khách hàng từ Supabase" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let body: {
    id?: string;
    type?: "individual" | "company";
    name: string;
    company_name?: string;
    phone: string;
    zalo_name?: string;
    email?: string;
    tax_id?: string;
    address?: string;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const cleanPhone = (body.phone || "").replace(/[\s.()-]/g, "");
  if (!body.name || cleanPhone.length < 9) {
    return NextResponse.json(
      { error: "Vui lòng nhập họ tên và số điện thoại hợp lệ." },
      { status: 400 }
    );
  }

  try {
    const savedCustomer = await SupabaseEntities.saveCustomer({
      id: body.id,
      type: body.type || "individual",
      name: body.name.trim(),
      phone: cleanPhone,
      company_name: body.company_name?.trim(),
      tax_id: body.tax_id?.trim(),
      zalo_name: body.zalo_name?.trim(),
      email: body.email?.trim(),
      address: body.address?.trim(),
      notes: body.notes?.trim(),
    });

    return NextResponse.json({ ok: true, customer: savedCustomer }, { status: 201 });
  } catch (err) {
    console.error("Lỗi lưu khách hàng vào Supabase:", err);
    return NextResponse.json({ error: "Không thể lưu khách hàng vào Supabase." }, { status: 500 });
  }
}
