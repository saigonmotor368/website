import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { SupabaseEntities, InvoiceRecord, InvoiceItemData, CustomerData } from "@/lib/supabase-entities";

function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `PT-${dateStr}-${random4}`;
}

export async function GET(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const caseId = url.searchParams.get("caseId") || undefined;
  const q = url.searchParams.get("q") || undefined;

  try {
    const list = await SupabaseEntities.getInvoices({ status, caseId, q });
    return NextResponse.json(list);
  } catch (err) {
    console.warn("Lỗi truy vấn invoices từ Supabase:", err);
    return NextResponse.json({ error: "Không thể tải danh sách phiếu từ Supabase" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let body: {
    case_id?: string;
    customer?: CustomerData;
    status?: "draft" | "issued";
    due_date?: string;
    notes?: string;
    items?: Array<{
      item_name: string;
      unit_price: number;
      quantity: number;
    }>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  let targetCustomer: CustomerData;
  let targetCaseNumber = "";
  let invoiceItems: InvoiceItemData[] = [];

  const invoiceId = crypto.randomUUID(); // Real UUID
  const now = new Date().toISOString();

  // If created from case_id, populate from case data
  if (body.case_id) {
    const caseRecord = await SupabaseEntities.getCaseById(body.case_id);
    if (!caseRecord) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ nguồn" }, { status: 404 });
    }

    targetCustomer = caseRecord.customer;
    targetCaseNumber = caseRecord.case_number;

    if (body.items && body.items.length > 0) {
      invoiceItems = body.items.map((i) => ({
        id: crypto.randomUUID(),
        invoice_id: invoiceId,
        item_name: i.item_name,
        unit_price: i.unit_price,
        quantity: i.quantity || 1,
        total_price: i.unit_price * (i.quantity || 1),
      }));
    } else {
      invoiceItems = caseRecord.items.map((ci) => ({
        id: crypto.randomUUID(),
        invoice_id: invoiceId,
        item_name: ci.service_name,
        unit_price: ci.adjusted_price,
        quantity: ci.quantity,
        total_price: ci.final_price,
      }));
    }
  } else {
    if (!body.customer?.name || !body.customer?.phone) {
      return NextResponse.json({ error: "Vui lòng nhập thông tin khách hàng" }, { status: 400 });
    }
    targetCustomer = body.customer;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Vui lòng nhập ít nhất 1 dòng dịch vụ" }, { status: 400 });
    }

    invoiceItems = body.items.map((i) => ({
      id: crypto.randomUUID(),
      invoice_id: invoiceId,
      item_name: i.item_name,
      unit_price: i.unit_price,
      quantity: i.quantity || 1,
      total_price: i.unit_price * (i.quantity || 1),
    }));
  }

  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total_price, 0);
  const invoiceNumber = generateInvoiceNumber();

  const invoiceRecord: InvoiceRecord = {
    id: invoiceId,
    invoice_number: invoiceNumber,
    case_id: body.case_id || "",
    case_number: targetCaseNumber,
    customer: targetCustomer,
    status: body.status || "issued",
    issued_at: body.status === "issued" ? now : undefined,
    due_date: body.due_date,
    total_amount: totalAmount,
    paid_amount: 0,
    balance: totalAmount,
    notes: body.notes,
    items: invoiceItems,
    payments: [],
    created_by: staff.user.id,
    created_at: now,
    updated_at: now,
  };

  try {
    // Save directly into Supabase with authenticated staff UUID
    await SupabaseEntities.saveInvoice(invoiceRecord, { actorId: staff.user.id });
  } catch (err) {
    console.error("Supabase invoice insert failed:", err);
    return NextResponse.json(
      { error: "Không thể lưu phiếu thanh toán vào Supabase. Vui lòng thử lại." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    invoice: invoiceRecord,
    invoiceNumber,
    id: invoiceId,
  }, { status: 201 });
}
