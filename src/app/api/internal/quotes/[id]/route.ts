import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type QuotePayload = {
  customer: {
    name: string;
    phone?: string;
    type?: "individual" | "company";
    company_name?: string;
    tax_id?: string;
    zalo_name?: string;
    address?: string;
  };
  vehicles?: Array<{
    license_plate?: string;
    owner_name?: string;
    vehicle_type?: string;
    brand?: string;
    model?: string;
    description?: string;
    quantity?: number;
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
  notes?: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  const admin = getSupabaseAdmin();
  const { data: quote, error } = await admin
    .from("quotes")
    .select(
      "id, quote_number, customer_id, status, total_amount, issued_at, created_at, updated_at, customer_snapshot, notes, data"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Không thể tải báo giá:", error);
    return NextResponse.json({ error: "Không thể tải báo giá" }, { status: 500 });
  }
  if (!quote) {
    return NextResponse.json({ error: "Không tìm thấy báo giá" }, { status: 404 });
  }

  const [{ data: itemRows }, { data: documentRows }] = await Promise.all([
    admin
      .from("quote_items")
      .select("id, service_name, unit_price, quantity, total_price, note, sort_order")
      .eq("quote_id", id)
      .order("sort_order", { ascending: true }),
    admin
      .from("quote_documents")
      .select("id, document_name, quantity, note, created_at")
      .eq("quote_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const legacy = (quote.data || {}) as Record<string, unknown>;
  const legacyCustomer = (legacy.customer || {}) as Record<string, unknown>;
  const snapshot = (quote.customer_snapshot || {}) as Record<string, unknown>;
  const legacyVehicle = (legacy.vehicle || null) as Record<string, unknown> | null;
  const legacyVehicles = Array.isArray(legacy.vehicles) ? legacy.vehicles : null;
  const legacyServices = Array.isArray(legacy.services) ? legacy.services : null;
  const legacyDocuments = Array.isArray(legacy.documents) ? legacy.documents : null;

  const services = legacyServices?.length
    ? legacyServices
    : (itemRows || []).map((item) => ({
        id: item.id,
        name: item.service_name,
        price: Number(item.unit_price) || 0,
        quantity: Number(item.quantity) || 1,
        note: item.note || "",
      }));

  const documents = legacyDocuments?.length
    ? legacyDocuments
    : (documentRows || []).map((document) => ({
        id: document.id,
        name: document.document_name,
        quantity: Number(document.quantity) || 1,
        note: document.note || "",
      }));

  const vehicles = legacyVehicles?.length
    ? legacyVehicles
    : legacyVehicle
      ? [
          {
            license_plate: legacyVehicle.licensePlate || "",
            owner_name: legacyVehicle.ownerName || "",
            vehicle_type: legacyVehicle.vehicleType || "car",
            brand: legacyVehicle.brand || "",
            model: legacyVehicle.model || "",
          },
        ]
      : [];

  return NextResponse.json({
    id: quote.id,
    quoteNumber: quote.quote_number || legacy.quoteNumber || quote.id,
    status: quote.status || "draft",
    customer: {
      id: quote.customer_id,
      name: snapshot.name || legacyCustomer.name || "",
      phone: snapshot.phone || legacyCustomer.phone || "",
      type: snapshot.type || "individual",
      company_name: snapshot.company_name || "",
      tax_id: snapshot.tax_id || "",
      zalo_name: snapshot.zalo_name || "",
      address: snapshot.address || "",
    },
    vehicles,
    services,
    documents,
    vatRate: Number(legacy.vatRate) || 0,
    notes: quote.notes || legacy.note || "",
    createdAt: quote.created_at,
    updatedAt: quote.updated_at,
    issuedAt: quote.issued_at,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  let body: QuotePayload;
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
  if (!body.services?.length) {
    return NextResponse.json({ error: "Vui lòng chọn ít nhất 1 dịch vụ" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: existing, error: existingError } = await admin
    .from("quotes")
    .select("id, quote_number, customer_id, created_at, data")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    console.error("Không thể đọc báo giá trước khi cập nhật:", existingError);
    return NextResponse.json({ error: "Không thể cập nhật báo giá" }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy báo giá" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const status = body.status || "draft";
  const subtotal = body.services.reduce(
    (sum, service) => sum + Number(service.price || 0) * Math.max(1, Number(service.quantity || 1)),
    0
  );
  const totalAmount = Math.round(subtotal + subtotal * ((Number(body.vatRate) || 0) / 100));
  const vehicles = body.vehicles || [];
  const firstVehicle = vehicles[0];

  let customerId = existing.customer_id as string | null;
  try {
    const { SupabaseEntities } = await import("@/lib/supabase-entities");
    const customer = await SupabaseEntities.saveCustomer({
      id: customerId || undefined,
      name: body.customer.name,
      phone: body.customer.phone?.trim() || "",
      type: body.customer.type || "individual",
      company_name: body.customer.company_name,
      tax_id: body.customer.tax_id,
      zalo_name: body.customer.zalo_name,
      address: body.customer.address,
      created_by: staff.user.id,
    });
    customerId = customer.id;
  } catch (customerError) {
    console.error("Không thể cập nhật khách hàng của báo giá:", customerError);
    return NextResponse.json({ error: "Không thể cập nhật thông tin khách hàng" }, { status: 500 });
  }

  const legacyData = {
    ...((existing.data || {}) as Record<string, unknown>),
    id,
    quoteNumber: existing.quote_number || id,
    customer: {
      name: body.customer.name.trim(),
      phone: body.customer.phone?.trim() || "",
      zaloName: body.customer.zalo_name?.trim() || "",
    },
    vehicle: firstVehicle
      ? {
          licensePlate: firstVehicle.license_plate || "",
          ownerName: firstVehicle.owner_name || body.customer.name,
          vehicleType: firstVehicle.vehicle_type || "car",
          brand: firstVehicle.brand || "",
          model: firstVehicle.model || firstVehicle.description || "",
          color: "",
          yearOfManufacture: new Date().getFullYear(),
          registeredProvince: "",
        }
      : null,
    vehicles,
    services: body.services.map((service) => ({
      id: service.id,
      name: service.name,
      price: Number(service.price) || 0,
      quantity: Math.max(1, Number(service.quantity) || 1),
      note: service.note || "",
    })),
    documents: (body.documents || []).map((document) => ({
      id: document.id,
      name: document.name,
      quantity: Math.max(1, Number(document.quantity) || 1),
      note: document.note || "",
    })),
    createdAt: existing.created_at,
    updatedAt: now,
    created_by: ((existing.data || {}) as Record<string, unknown>).created_by || staff.user.id,
    updated_by: staff.user.id,
    vatRate: Number(body.vatRate) || 0,
    note: body.notes || "",
  };

  const { error: updateError } = await admin
    .from("quotes")
    .update({
      data: legacyData,
      customer_id: customerId,
      customer_snapshot: {
        ...body.customer,
        name: body.customer.name.trim(),
        phone: body.customer.phone?.trim() || "",
        zalo_name: body.customer.zalo_name?.trim() || "",
      },
      status,
      issued_at: status === "issued" ? now : null,
      total_amount: totalAmount,
      notes: body.notes || null,
      updated_at: now,
    })
    .eq("id", id);

  if (updateError) {
    console.error("Không thể cập nhật báo giá:", updateError);
    return NextResponse.json({ error: "Không thể cập nhật báo giá" }, { status: 500 });
  }

  const [{ error: deleteItemsError }, { error: deleteDocumentsError }] = await Promise.all([
    admin.from("quote_items").delete().eq("quote_id", id),
    admin.from("quote_documents").delete().eq("quote_id", id),
  ]);

  if (deleteItemsError || deleteDocumentsError) {
    console.error("Không thể làm mới chi tiết báo giá:", deleteItemsError || deleteDocumentsError);
    return NextResponse.json({ error: "Báo giá đã cập nhật nhưng chưa thể đồng bộ chi tiết" }, { status: 500 });
  }

  const itemRows = body.services.map((service, index) => ({
    id: crypto.randomUUID(),
    quote_id: id,
    service_name: service.name,
    unit_price: Number(service.price) || 0,
    quantity: Math.max(1, Number(service.quantity) || 1),
    total_price: (Number(service.price) || 0) * Math.max(1, Number(service.quantity) || 1),
    note: service.note || null,
    sort_order: index + 1,
  }));
  const documentRows = (body.documents || []).map((document) => ({
    id: crypto.randomUUID(),
    quote_id: id,
    document_name: document.name,
    quantity: Math.max(1, Number(document.quantity) || 1),
    note: document.note || null,
  }));

  const [{ error: itemsError }, { error: documentsError }] = await Promise.all([
    itemRows.length ? admin.from("quote_items").insert(itemRows) : Promise.resolve({ error: null }),
    documentRows.length
      ? admin.from("quote_documents").insert(documentRows)
      : Promise.resolve({ error: null }),
  ]);

  if (itemsError || documentsError) {
    console.error("Không thể ghi lại chi tiết báo giá:", itemsError || documentsError);
    return NextResponse.json({ error: "Báo giá đã cập nhật nhưng chưa thể đồng bộ chi tiết" }, { status: 500 });
  }

  try {
    const { SupabaseEntities } = await import("@/lib/supabase-entities");
    await SupabaseEntities.logAudit({
      action: status === "issued" ? "issue_quote" : "update_quote",
      entityType: "quote",
      entityId: id,
      actorName: staff.profile.full_name || staff.user.email,
      newData: { quote_number: existing.quote_number, status, total_amount: totalAmount },
    });
  } catch {
    // Không làm hỏng luồng chính nếu nhật ký tạm thời không ghi được.
  }

  return NextResponse.json({
    ok: true,
    id,
    quoteNumber: existing.quote_number || id,
    status,
    totalAmount,
    issuedAt: status === "issued" ? now : null,
  });
}
