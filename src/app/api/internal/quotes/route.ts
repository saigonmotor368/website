import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function generateFallbackQuoteNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `BG-${dateStr}-${random4}`;
}

export async function GET(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const admin = getSupabaseAdmin();

  try {
    let query = admin
      .from("quotes")
      .select("id, quote_number, status, total_amount, issued_at, created_at, updated_at, customer_snapshot, data")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: quotes, error } = await query;
    if (error) {
      console.error("Không thể tải danh sách báo giá từ Supabase:", error);
      return NextResponse.json(
        { error: "Không thể tải danh sách báo giá. Vui lòng thử lại." },
        { status: 500 }
      );
    }

    if (quotes) {
      // Exclude records that are internal cases/invoices
      const actualQuotes = quotes.filter((item) => {
        const d = (item.data || {}) as Record<string, unknown>;
        return !d._entity_type;
      });

      let filtered = actualQuotes.map((item) => {
        const legacyData = (item.data || {}) as {
          quoteNumber?: string;
          customer?: { name?: string; phone?: string };
          vehicle?: { licensePlate?: string; brand?: string; model?: string };
          services?: Array<{ name: string; price: number; quantity: number }>;
          vatRate?: number;
          case_id?: string;
        };

        const snapshot = (item.customer_snapshot || {}) as {
          name?: string;
          phone?: string;
          company_name?: string;
        };

        const customerName = snapshot.name || legacyData.customer?.name || "Khách hàng";
        const customerPhone = snapshot.phone || legacyData.customer?.phone || "";
        const quoteNumber = item.quote_number || legacyData.quoteNumber || item.id;

        // Calculate amount if not in column
        let amount = Number(item.total_amount) || 0;
        if (!amount && legacyData.services) {
          const sub = legacyData.services.reduce((s, x) => s + x.price * x.quantity, 0);
          amount = sub + sub * ((legacyData.vatRate || 0) / 100);
        }

        return {
          id: item.id,
          quote_number: quoteNumber,
          status: item.status || "issued",
          customer_name: customerName,
          customer_phone: customerPhone,
          company_name: snapshot.company_name,
          vehicle_plate: legacyData.vehicle?.licensePlate,
          vehicle_desc: legacyData.vehicle ? `${legacyData.vehicle.brand || ""} ${legacyData.vehicle.model || ""}`.trim() : null,
          total_amount: amount,
          services_count: legacyData.services?.length || 0,
          case_id: legacyData.case_id || null,
          created_at: item.created_at || legacyData.quoteNumber,
        };
      });

      if (q) {
        filtered = filtered.filter(
          (x) =>
            x.customer_name.toLowerCase().includes(q) ||
            x.customer_phone.includes(q) ||
            x.quote_number.toLowerCase().includes(q) ||
            (x.vehicle_plate && x.vehicle_plate.toLowerCase().includes(q))
        );
      }

      return NextResponse.json(filtered);
    }
  } catch (err) {
    console.error("Lỗi truy vấn quotes:", err);
    return NextResponse.json(
      { error: "Không thể tải danh sách báo giá. Vui lòng thử lại." },
      { status: 500 }
    );
  }

  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let body: {
    customer: {
      id?: string;
      name: string;
      phone?: string;
      type?: "individual" | "company";
      company_name?: string;
      tax_id?: string;
      zalo_name?: string;
      address?: string;
    };
    vehicles: Array<{
      id?: string;
      license_plate?: string;
      owner_name?: string;
      vehicle_type?: string;
      brand?: string;
      model?: string;
      description?: string;
    }>;
    services: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      note?: string;
    }>;
    documents?: Array<{
      id: string;
      name: string;
      quantity: number;
      note?: string;
    }>;
    status?: "draft" | "issued";
    vatRate?: number;
    includeRegistrationFee?: boolean;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  if (!body.customer?.name?.trim()) {
    return NextResponse.json({ error: "Vui lòng nhập tên khách hàng hoặc người liên hệ" }, { status: 400 });
  }

  if (!body.customer.phone?.trim() && !body.customer.zalo_name?.trim()) {
    return NextResponse.json({ error: "Vui lòng nhập số điện thoại hoặc tên Zalo" }, { status: 400 });
  }

  if (!body.services || body.services.length === 0) {
    return NextResponse.json({ error: "Vui lòng chọn ít nhất 1 dịch vụ" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  // Try generating database sequence number or fallback
  let quoteNumber = generateFallbackQuoteNumber();
  try {
    const { data: genRes } = await admin.rpc("generate_quote_number");
    if (genRes) quoteNumber = genRes;
  } catch {
    // fallback is used
  }

  const subtotal = body.services.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const vat = subtotal * ((body.vatRate || 0) / 100);
  const totalAmount = Math.round(subtotal + vat);
  const now = new Date().toISOString();
  const quoteId = crypto.randomUUID();

  // Construct legacy data object for 100% compatibility with existing PDF generator and older views
  const legacyQuoteData = {
    id: quoteId,
    quoteNumber,
    customer: {
      name: body.customer.name,
      phone: body.customer.phone?.trim() || "",
      zaloName: body.customer.zalo_name?.trim() || "",
    },
    vehicle: body.vehicles[0]
      ? {
          licensePlate: body.vehicles[0].license_plate || "Chưa có biển",
          ownerName: body.vehicles[0].owner_name || body.customer.name,
          vehicleType: body.vehicles[0].vehicle_type || "car",
          brand: body.vehicles[0].brand || "",
          model: body.vehicles[0].model || "",
          color: "",
          yearOfManufacture: new Date().getFullYear(),
          registeredProvince: "",
        }
      : null,
    vehicles: body.vehicles,
    services: body.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      quantity: s.quantity,
      note: s.note || "",
    })),
    documents: (body.documents || []).map((d) => ({
      id: d.id,
      name: d.name,
      quantity: d.quantity,
      note: d.note || "",
    })),
    createdAt: now,
    created_by: staff.user.id,
    vatRate: body.vatRate || 0,
    includeRegistrationFee: !!body.includeRegistrationFee,
    note: body.notes || "",
  };

  // Upsert customer with canonical deduplication
  let customerId = body.customer.id;
  try {
    const { SupabaseEntities } = await import("@/lib/supabase-entities");
    const savedCust = await SupabaseEntities.saveCustomer({
      id: customerId,
      name: body.customer.name,
      phone: body.customer.phone?.trim() || "",
      type: body.customer.type || "individual",
      company_name: body.customer.company_name,
      tax_id: body.customer.tax_id,
      zalo_name: body.customer.zalo_name,
      address: body.customer.address,
      created_by: staff.user.id,
    });
    customerId = savedCust.id;
  } catch (cErr) {
    console.warn("Could not upsert customer:", cErr);
  }

  const quoteRecord: Record<string, unknown> = {
    id: quoteId,
    data: legacyQuoteData,
    quote_number: quoteNumber,
    customer_id: customerId || null,
    status: body.status || "issued",
    issued_at: body.status === "issued" ? now : null,
    total_amount: totalAmount,
    customer_snapshot: body.customer,
    notes: body.notes || null,
    created_at: now,
  };

  try {
    const { data: inserted, error: insertErr } = await admin
      .from("quotes")
      .insert(quoteRecord)
      .select()
      .single();

    if (insertErr) {
      throw new Error(`Supabase quotes insert failed: ${insertErr.message}`);
    }

    // Insert items and docs into normalized tables
    if (body.services?.length) {
      const itemRecords = body.services.map((s, idx) => ({
        id: crypto.randomUUID(),
        quote_id: quoteId,
        service_name: s.name,
        unit_price: s.price,
        quantity: s.quantity,
        total_price: s.price * s.quantity,
        note: s.note || null,
        sort_order: idx + 1,
      }));
      await admin.from("quote_items").insert(itemRecords);
    }

    if (body.documents?.length) {
      const docRecords = body.documents.map((d) => ({
        id: crypto.randomUUID(),
        quote_id: quoteId,
        document_name: d.name,
        quantity: d.quantity,
        note: d.note || null,
      }));
      await admin.from("quote_documents").insert(docRecords);
    }

    // Log audit event
    try {
      const { SupabaseEntities } = await import("@/lib/supabase-entities");
      await SupabaseEntities.logAudit({
        action: "create_quote",
        entityType: "quote",
        entityId: quoteId,
        actorName: staff.profile.full_name || staff.user.email,
        newData: { quote_number: quoteNumber, total_amount: totalAmount, status: quoteRecord.status },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      ok: true,
      quote: inserted || quoteRecord,
      quoteNumber,
      id: quoteId,
    }, { status: 201 });
  } catch (error) {
    console.error("Quote creation failed:", error);
    return NextResponse.json({ error: "Không thể tạo báo giá." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let body: { id: string; action?: "issue" | "accept" | "reject" | "update_status"; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Thiếu ID báo giá" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: quoteRow, error: fetchErr } = await admin
    .from("quotes")
    .select("id, data")
    .eq("id", body.id)
    .single();

  if (fetchErr || !quoteRow) {
    return NextResponse.json({ error: "Không tìm thấy báo giá" }, { status: 404 });
  }

  let newStatus = body.status;
  if (body.action === "issue") newStatus = "issued";
  else if (body.action === "accept") newStatus = "accepted";
  else if (body.action === "reject") newStatus = "rejected";

  const now = new Date().toISOString();
  const updatedData = {
    ...((quoteRow.data as Record<string, unknown>) || {}),
    status: newStatus || "issued",
    updated_at: now,
    updated_by: staff.user.id,
  };

  const { error: updateErr } = await admin
    .from("quotes")
    .update({
      status: newStatus || "issued",
      data: updatedData,
    })
    .eq("id", body.id);

  if (updateErr) {
    return NextResponse.json({ error: "Không thể cập nhật báo giá" }, { status: 500 });
  }

  // Audit log
  try {
    const { SupabaseEntities } = await import("@/lib/supabase-entities");
    await SupabaseEntities.logAudit({
      action: "update_quote_status",
      entityType: "quote",
      entityId: body.id,
      actorId: staff.user.id,
      actorName: staff.profile.full_name || staff.user.email,
      newData: { status: newStatus },
    });
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
