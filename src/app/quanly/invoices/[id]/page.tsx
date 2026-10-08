"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  case_id?: string;
  case_number?: string;
  customer: {
    name: string;
    phone: string;
    company_name?: string;
    tax_id?: string;
    address?: string;
  };
  status: "draft" | "issued" | "cancelled";
  issued_at?: string;
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  notes?: string;
  items: Array<{
    id: string;
    item_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
  }>;
  payments: Array<{
    id: string;
    payment_date: string;
    amount: number;
    payment_method: "cash" | "bank_transfer" | "other";
    reference_code?: string;
    notes?: string;
    recorded_name?: string;
  }>;
  created_at: string;
}

function formatMoney(amount: number): string {
  return (amount || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return dateStr;
  }
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<"cash" | "bank_transfer" | "other">("bank_transfer");
  const [payRef, setPayRef] = useState("");
  const [payNote, setPayNote] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadInvoice() {
      try {
        const res = await fetch(`/api/internal/invoices/${id}`);
        if (!res.ok) {
          throw new Error("Không thể tải thông tin phiếu thanh toán");
        }
        const data = await res.json();
        if (!ignore) {
          setInvoice(data);
          setPayAmount(data.balance || 0);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadInvoice();
    return () => {
      ignore = true;
    };
  }, [id, refreshKey]);

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (payAmount <= 0) {
      alert("Số tiền thanh toán phải lớn hơn 0");
      return;
    }

    setPaySubmitting(true);
    try {
      const res = await fetch(`/api/internal/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          payment: {
            amount: payAmount,
            payment_method: payMethod,
            reference_code: payRef.trim() || undefined,
            notes: payNote.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể ghi nhận thanh toán");
      }

      setPayModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setPaySubmitting(false);
    }
  }

  async function handleCancelInvoice() {
    const reason = prompt("Nhập lý do hủy phiếu thanh toán này (Chỉ Owner có quyền):");
    if (!reason) return;

    try {
      const res = await fetch(`/api/internal/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel_invoice",
          cancel_reason: reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Không thể hủy phiếu");
        return;
      }

      setRefreshKey((k) => k + 1);
    } catch {
      alert("Lỗi kết nối");
    }
  }

  if (loading) {
    return (
      <div className="quanly-content-container text-center py-20 text-gray-400">
        Đang nạp chi tiết phiếu thanh toán...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="quanly-content-container py-12 text-center space-y-4">
        <div className="text-red-400 text-sm">⚠️ {error || "Không tìm thấy phiếu"}</div>
        <Link href="/quanly/invoices" className="quanly-btn-secondary text-xs inline-block">
          ← Quay lại danh sách phiếu
        </Link>
      </div>
    );
  }

  return (
    <div className="quanly-content-container max-w-4xl space-y-6">
      {/* Action Bar (Hidden when printing) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/quanly/invoices"
            className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded bg-gray-900 border border-gray-800"
          >
            ← Danh sách phiếu
          </Link>
          <span className="font-mono text-sm font-bold text-[#d4af37]">
            {invoice.invoice_number}
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
              invoice.status === "issued"
                ? "bg-blue-950/60 text-blue-300 border border-blue-800/40"
                : invoice.status === "cancelled"
                ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            {invoice.status === "issued"
              ? "Đã phát hành"
              : invoice.status === "cancelled"
              ? "Đã hủy"
              : "Bản nháp"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status === "issued" && invoice.balance > 0 && (
            <button
              onClick={() => {
                setPayAmount(invoice.balance);
                setPayModalOpen(true);
              }}
              className="quanly-btn-primary text-xs flex items-center gap-1 shadow-md shadow-emerald-950/40"
            >
              <span>＋</span> Ghi nhận thu tiền
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold text-gray-200 hover:text-white border border-gray-700 transition flex items-center gap-1"
          >
            <span>🖨</span> In phiếu (A4)
          </button>

          {invoice.status === "issued" && invoice.paid_amount === 0 && (
            <button
              onClick={handleCancelInvoice}
              className="px-3 py-1.5 rounded-lg bg-rose-950/50 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 border border-rose-800 transition"
              title="Hủy phiếu thanh toán (Chỉ Owner)"
            >
              Hủy phiếu
            </button>
          )}
        </div>
      </div>

      {/* Printable Invoice Sheet */}
      <div className="bg-[#121620] print:bg-white print:text-black border border-gray-800 print:border-none rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Header with Saigon Motor Branding */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-gray-800 print:border-gray-300 pb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo_sgm.png"
              alt="Saigon Motor"
              width={56}
              height={56}
              className="object-contain"
            />
            <div>
              <h2 className="text-base font-bold text-white print:text-black tracking-wide">
                SAIGON MOTOR
              </h2>
              <p className="text-[11px] text-[#d4af37] print:text-gray-700 font-semibold">
                Chi nhánh Công ty TNHH Ô tô Xe máy 368
              </p>
              <p className="text-[10px] text-gray-400 print:text-gray-600">
                Hotline hỗ trợ: 0704 104 104 • Website: saigonmotor.vn
              </p>
            </div>
          </div>

          <div className="text-right sm:self-center">
            <h1 className="text-lg font-extrabold text-white print:text-black uppercase tracking-wider">
              PHIẾU THANH TOÁN
            </h1>
            <p className="text-[11px] text-gray-400 print:text-gray-600">
              (Biên nhận dịch vụ pháp lý xe)
            </p>
            <div className="mt-1 font-mono text-xs font-bold text-[#d4af37] print:text-black">
              Số: {invoice.invoice_number}
            </div>
            <div className="text-[10px] text-gray-400 print:text-gray-600">
              Ngày: {formatDate(invoice.issued_at || invoice.created_at)}
            </div>
          </div>
        </div>

        {/* Customer & Case info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-black/30 print:bg-gray-100 rounded-xl space-y-1.5">
            <div className="text-[10px] font-bold uppercase text-gray-500 print:text-gray-600">
              Khách hàng / Đơn vị thanh toán
            </div>
            <div className="font-bold text-white print:text-black text-sm">
              {invoice.customer.name}
            </div>
            <div className="text-gray-400 print:text-gray-700 font-mono">
              Điện thoại: {invoice.customer.phone}
            </div>
            {invoice.customer.company_name && (
              <div className="text-gray-300 print:text-gray-800">
                Đơn vị: {invoice.customer.company_name}
              </div>
            )}
            {invoice.customer.tax_id && (
              <div className="text-gray-400 print:text-gray-700 font-mono">
                MST: {invoice.customer.tax_id}
              </div>
            )}
            {invoice.customer.address && (
              <div className="text-gray-400 print:text-gray-700">
                Địa chỉ: {invoice.customer.address}
              </div>
            )}
          </div>

          <div className="p-4 bg-black/30 print:bg-gray-100 rounded-xl space-y-1.5">
            <div className="text-[10px] font-bold uppercase text-gray-500 print:text-gray-600">
              Thông tin giao dịch
            </div>
            {invoice.case_number ? (
              <div className="text-gray-300 print:text-gray-800">
                Mã hồ sơ gốc:{" "}
                <span className="font-mono font-bold text-white print:text-black">
                  {invoice.case_number}
                </span>
              </div>
            ) : null}
            {invoice.due_date && (
              <div className="text-gray-400 print:text-gray-700">
                Hạn thanh toán: <span className="font-semibold">{invoice.due_date}</span>
              </div>
            )}
            <div className="text-gray-400 print:text-gray-700">
              Trạng thái:{" "}
              <span className="font-semibold text-emerald-400 print:text-green-700">
                {invoice.balance === 0 ? "Đã thu đủ 100%" : "Còn công nợ chưa thu đủ"}
              </span>
            </div>
            {invoice.notes && (
              <div className="text-gray-400 print:text-gray-700 italic">
                Ghi chú: {invoice.notes}
              </div>
            )}
          </div>
        </div>

        {/* Services Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 print:text-black border-collapse">
            <thead>
              <tr className="border-b border-gray-800 print:border-gray-400 bg-black/40 print:bg-gray-200 uppercase text-[10px] text-gray-400 print:text-gray-700">
                <th className="py-2.5 px-3 w-10 text-center">STT</th>
                <th className="py-2.5 px-3">Tên dịch vụ pháp lý thực hiện</th>
                <th className="py-2.5 px-3 font-mono text-right">Đơn giá</th>
                <th className="py-2.5 px-3 text-center w-12">SL</th>
                <th className="py-2.5 px-3 font-mono text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 print:divide-gray-300">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3 px-3 text-center text-gray-500">{idx + 1}</td>
                  <td className="py-3 px-3 font-medium text-white print:text-black">
                    {item.item_name}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-gray-400 print:text-gray-700">
                    {formatMoney(item.unit_price)}
                  </td>
                  <td className="py-3 px-3 font-mono text-center">{item.quantity}</td>
                  <td className="py-3 px-3 font-mono text-right font-bold text-white print:text-black">
                    {formatMoney(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Box */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-800/80 print:border-gray-300">
              <span className="text-gray-400 print:text-gray-700">Tổng cộng chi phí dịch vụ:</span>
              <span className="font-mono font-bold text-white print:text-black">
                {formatMoney(invoice.total_amount)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800/80 print:border-gray-300">
              <span className="text-gray-400 print:text-gray-700">Số tiền đã thanh toán:</span>
              <span className="font-mono font-bold text-emerald-400 print:text-green-700">
                {formatMoney(invoice.paid_amount)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-sm">
              <span className="text-white print:text-black">Còn lại phải thu (Công nợ):</span>
              <span className="font-mono text-amber-400 print:text-black">
                {formatMoney(invoice.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="pt-4 border-t border-gray-800 print:border-gray-300 space-y-2 text-xs">
            <h4 className="font-bold text-white print:text-black text-xs uppercase tracking-wide">
              Lịch sử các lần nhận tiền
            </h4>
            <div className="space-y-1.5">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded bg-black/40 print:bg-gray-100 text-[11px]"
                >
                  <div>
                    <span className="font-semibold text-white print:text-black">
                      {p.payment_method === "cash"
                        ? "Tiền mặt"
                        : p.payment_method === "bank_transfer"
                        ? "Chuyển khoản"
                        : "Khác"}
                    </span>{" "}
                    • {formatDate(p.payment_date)}
                    {p.reference_code && (
                      <span className="text-gray-400 print:text-gray-600 ml-1">
                        (Mã GD: {p.reference_code})
                      </span>
                    )}
                    {p.notes && (
                      <span className="text-gray-400 print:text-gray-600 ml-1 italic">
                        - {p.notes}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-emerald-400 print:text-green-700">
                    +{formatMoney(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Disclaimer / Signatures */}
        <div className="pt-8 border-t border-gray-800 print:border-gray-300 grid grid-cols-2 text-center text-xs text-gray-400 print:text-black">
          <div>
            <div className="font-bold uppercase text-[11px]">Người lập phiếu</div>
            <div className="h-16" />
            <div className="font-medium text-white print:text-black">Phạm Xuân Định</div>
          </div>
          <div>
            <div className="font-bold uppercase text-[11px]">Khách hàng ký nhận</div>
            <div className="h-16" />
            <div className="font-medium text-white print:text-black">{invoice.customer.name}</div>
          </div>
        </div>
      </div>

      {/* MODAL: Record Payment */}
      {payModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordPayment}
            className="bg-[#121620] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">💰 Ghi nhận Thu tiền Khách hàng</h3>
            <p className="text-xs text-gray-400">
              Công nợ hiện tại:{" "}
              <span className="font-mono font-bold text-amber-400">
                {formatMoney(invoice.balance)}
              </span>
            </p>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Phương thức thanh toán</label>
              <select
                value={payMethod}
                onChange={(e) =>
                  setPayMethod(e.target.value as "cash" | "bank_transfer" | "other")
                }
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                <option value="cash">Tiền mặt</option>
                <option value="other">Hình thức khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Số tiền thu (VNĐ) *</label>
              <input
                type="number"
                min={1}
                max={invoice.balance}
                required
                value={payAmount || ""}
                onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Mã tham chiếu / Mã chuẩn chi ngân hàng
              </label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="Ví dụ: FT261007..."
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Ghi chú thu tiền</label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="Ví dụ: Đặt cọc lần 1..."
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-xs text-gray-300 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={paySubmitting}
                className="quanly-btn-primary text-xs"
              >
                {paySubmitting ? "Đang lưu..." : "Xác nhận thu tiền"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
