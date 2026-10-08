import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { SupabaseEntities, PaymentData } from "@/lib/supabase-entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const invoice = await SupabaseEntities.getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json({ error: "Không tìm thấy phiếu thanh toán" }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: "Lỗi truy vấn phiếu thanh toán từ Supabase" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  let body: {
    action: "record_payment" | "cancel_invoice" | "issue_invoice";
    payment?: {
      amount: number;
      payment_method: "cash" | "bank_transfer" | "other";
      reference_code?: string;
      notes?: string;
    };
    cancel_reason?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  const invoice = await SupabaseEntities.getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: "Không tìm thấy phiếu thanh toán" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const actorName = staff.profile.full_name || staff.user.email;
  const isOwner = staff.profile.role === "owner";

  // 1. Record Payment
  if (body.action === "record_payment") {
    const paymentData = body.payment || {
      amount: (body as unknown as { amount?: number }).amount || 0,
      payment_method: (body as unknown as { payment_method?: "cash" | "bank_transfer" | "other" }).payment_method || "bank_transfer",
      reference_code: (body as unknown as { reference_code?: string }).reference_code,
      notes: (body as unknown as { notes?: string }).notes,
    };

    if (invoice.status === "cancelled") {
      return NextResponse.json({ error: "Không thể thu tiền trên phiếu đã bị hủy" }, { status: 400 });
    }

    const payAmount = Math.round(Number(paymentData.amount) || 0);
    if (payAmount <= 0) {
      return NextResponse.json({ error: "Số tiền thu phải lớn hơn 0" }, { status: 400 });
    }

    if (payAmount > invoice.balance) {
      return NextResponse.json({
        error: `Số tiền thu (${payAmount.toLocaleString("vi-VN")}đ) vượt quá công nợ còn lại (${invoice.balance.toLocaleString("vi-VN")}đ)`
      }, { status: 400 });
    }

    const newPayment: PaymentData = {
      id: crypto.randomUUID(),
      invoice_id: invoice.id,
      payment_date: now,
      amount: payAmount,
      payment_method: paymentData.payment_method || "bank_transfer",
      reference_code: paymentData.reference_code,
      notes: paymentData.notes,
      recorded_by: staff.user.id,
      recorded_name: actorName,
    };

    invoice.payments.push(newPayment);
    invoice.paid_amount += payAmount;
    invoice.balance = Math.max(0, invoice.total_amount - invoice.paid_amount);

    try {
      const updated = await SupabaseEntities.saveInvoice(invoice, { actorId: staff.user.id });
      return NextResponse.json({ ok: true, invoice: updated, payment: newPayment });
    } catch {
      return NextResponse.json({ error: "Không thể lưu giao dịch thanh toán vào Supabase" }, { status: 500 });
    }
  }

  // 2. Cancel Invoice (Strictly Owner)
  if (body.action === "cancel_invoice") {
    if (!isOwner) {
      return NextResponse.json(
        { error: "Chỉ chủ hệ thống (Owner - Phạm Xuân Định) mới có quyền hủy phiếu thanh toán." },
        { status: 403 }
      );
    }

    if (invoice.paid_amount > 0) {
      return NextResponse.json(
        { error: "Phiếu đã có giao dịch thu tiền thực tế, không thể hủy. Cần hoàn trả tiền hoặc điều chỉnh trước." },
        { status: 400 }
      );
    }

    invoice.status = "cancelled";
    invoice.notes = `${invoice.notes || ""} [Hủy bởi ${actorName} lúc ${now}. Lý do: ${body.cancel_reason || "Hủy theo yêu cầu"}]`.trim();

    try {
      const updated = await SupabaseEntities.saveInvoice(invoice, { actorId: staff.user.id });
      return NextResponse.json({ ok: true, invoice: updated });
    } catch {
      return NextResponse.json({ error: "Không thể hủy phiếu trên Supabase" }, { status: 500 });
    }
  }

  // 3. Issue Invoice
  if (body.action === "issue_invoice" || (body.action as string) === "update_status") {
    invoice.status = "issued";
    invoice.issued_at = now;

    try {
      const updated = await SupabaseEntities.saveInvoice(invoice, { actorId: staff.user.id });
      return NextResponse.json({ ok: true, invoice: updated });
    } catch {
      return NextResponse.json({ error: "Không thể phát hành phiếu trên Supabase" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
}
