"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function InvoiceCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(!!caseId);
  const [error, setError] = useState("");

  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Case reference
  const [caseNumber, setCaseNumber] = useState("");

  // Items
  const [items, setItems] = useState<Array<{ item_name: string; unit_price: number; quantity: number }>>([]);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!caseId) return;

    let ignore = false;
    async function loadCase() {
      try {
        const res = await fetch(`/api/internal/cases/${caseId}`);
        if (!res.ok) return;
        const caseData = await res.json();
        if (!ignore && caseData) {
          setCaseNumber(caseData.case_number);
          setCustomerName(caseData.customer.name || "");
          setCustomerPhone(caseData.customer.phone || "");
          setCompanyName(caseData.customer.company_name || "");
          setTaxId(caseData.customer.tax_id || "");
          setCustomerAddress(caseData.customer.address || "");

          if (caseData.items && Array.isArray(caseData.items)) {
            setItems(
              caseData.items.map((ci: { service_name: string; adjusted_price: number; quantity: number }) => ({
                item_name: ci.service_name,
                unit_price: ci.adjusted_price,
                quantity: ci.quantity || 1,
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Lỗi load case data:", err);
      } finally {
        if (!ignore) setInitLoading(false);
      }
    }

    loadCase();
    return () => {
      ignore = true;
    };
  }, [caseId]);

  function handleAddItem() {
    setItems((prev) => [
      ...prev,
      { item_name: "Dịch vụ pháp lý bổ sung", unit_price: 500000, quantity: 1 },
    ]);
  }

  function handleUpdateItem(index: number, field: string, val: string | number) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Vui lòng nhập thông tin khách hàng");
      return;
    }

    if (items.length === 0) {
      setError("Phiếu thanh toán cần ít nhất 1 dòng dịch vụ");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        case_id: caseId || undefined,
        customer: {
          id: `cust_${Date.now()}`,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          type: companyName ? ("company" as const) : ("individual" as const),
          company_name: companyName.trim() || undefined,
          tax_id: taxId.trim() || undefined,
          address: customerAddress.trim() || undefined,
          created_at: new Date().toISOString(),
        },
        status: "issued" as const,
        due_date: dueDate || undefined,
        notes: notes.trim() || undefined,
        items,
      };

      const res = await fetch("/api/internal/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo phiếu thanh toán");
      }

      router.push(`/quanly/invoices/${data.id || data.invoice?.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  if (initLoading) {
    return (
      <div className="quanly-content-container text-center py-20 text-gray-400">
        Đang nạp dữ liệu từ hồ sơ...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="quanly-content-container max-w-4xl">
      {/* Top Banner */}
      <div className="quanly-page-header">
        <div className="quanly-page-title-group">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/quanly/invoices"
              className="text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 inline-flex items-center"
            >
              ← Danh sách phiếu
            </Link>
            {caseNumber && (
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                Từ hồ sơ: {caseNumber}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2.5">
            🧾 Lập Phiếu Thanh toán / Biên nhận Dịch vụ
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Xuất phiếu biên nhận thu tiền dịch vụ xe cho khách hàng và theo dõi công nợ
          </p>
        </div>

        <div className="quanly-action-bar quanly-action-bar-single">
          <button type="submit" disabled={loading} className="quanly-btn-primary">
            {loading ? "Đang xử lý..." : "✓ Phát hành phiếu thanh toán"}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
          ⚠️ {error}
        </div>
      )}

      {/* Customer Info Card */}
      <div className="quanly-card space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>👤</span> Thông tin khách hàng thanh toán
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Tên khách hàng / Đại diện *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Số điện thoại liên hệ *</label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Tên công ty (nếu có)</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Công ty CP / TNHH..."
              className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Mã số thuế (MST)</label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="03xxxxxxxx"
              className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-gray-400 mb-1">Địa chỉ</label>
          <input
            type="text"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Services Items Card */}
      <div className="quanly-card space-y-4">
        <div className="quanly-section-head">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📋</span> Nội dung thanh toán dịch vụ
          </h2>
          <span className="font-mono tabular-nums text-sm font-bold text-emerald-400 shrink-0">
            Tổng cộng: {totalAmount.toLocaleString("vi-VN")}đ
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-black/40 border border-gray-800 rounded-xl space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  required
                  value={item.item_name}
                  onChange={(e) => handleUpdateItem(idx, "item_name", e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-white focus:outline-none border-b border-gray-800/80 pb-1 focus:border-[#d4af37]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  aria-label="Xóa dòng dịch vụ"
                  className="text-gray-500 hover:text-red-400 text-xs px-1.5 py-1 shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] text-gray-500 shrink-0">Đơn giá:</span>
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleUpdateItem(idx, "unit_price", parseInt(e.target.value) || 0)
                    }
                    className="w-full sm:w-28 min-w-0 bg-[#0d1017] border border-gray-800 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] text-gray-500 shrink-0">SL:</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateItem(idx, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-full sm:w-16 min-w-0 bg-[#0d1017] border border-gray-800 rounded px-2 py-1.5 text-xs text-white font-mono text-center"
                  />
                </div>

                <span className="col-span-2 sm:col-span-1 sm:ml-auto text-xs font-mono tabular-nums font-bold text-emerald-400 text-right">
                  {(item.unit_price * item.quantity).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2.5 border border-dashed border-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-600 transition"
          >
            ＋ Thêm dòng dịch vụ
          </button>
        </div>
      </div>

      {/* Due Date & Notes */}
      <div className="quanly-card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-white mb-1">
            📅 Hạn thanh toán (nếu có)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-white mb-1">
            📝 Ghi chú trên phiếu
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Đã nhận cọc 50%, thanh toán phần còn lại khi giao hồ sơ..."
            className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex justify-end pt-4 border-t border-gray-800">
        <div className="quanly-action-bar">
          <Link href="/quanly/invoices" className="quanly-btn-secondary">
            Hủy
          </Link>
          <button type="submit" disabled={loading} className="quanly-btn-primary">
            {loading ? "Đang xử lý..." : "✓ Phát hành phiếu"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function InvoiceCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="quanly-content-container text-center py-20 text-gray-400">
          Đang tải giao diện lập phiếu thanh toán...
        </div>
      }
    >
      <InvoiceCreateForm />
    </Suspense>
  );
}
