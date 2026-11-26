"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { generateQuoteImage } from "@/lib/generate-quote-pdf";
import { formatMoneyToVietnameseWords } from "../../lib/money-to-words";

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
  subtotal_amount?: number;
  vat_rate?: number;
  vat_amount?: number;
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
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
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
  const [docMode, setDocMode] = useState<"color" | "bw">("color");
  const [exportingImage, setExportingImage] = useState(false);

  // Payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<"cash" | "bank_transfer" | "other">("bank_transfer");
  const [payRef, setPayRef] = useState("");
  const [payNote, setPayNote] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);

  // Edit Company / Customer & VAT modal state
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editCustName, setEditCustName] = useState("");
  const [editCustPhone, setEditCustPhone] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editTaxId, setEditTaxId] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editVatRate, setEditVatRate] = useState<0 | 8 | 10>(0);
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  function openEditInfoModal() {
    if (!invoice) return;
    setEditCustName(invoice.customer.name || "");
    setEditCustPhone(invoice.customer.phone || "");
    setEditCompanyName(invoice.customer.company_name || "");
    setEditTaxId(invoice.customer.tax_id || "");
    setEditAddress(invoice.customer.address || "");
    setEditVatRate(invoice.vat_rate === 8 ? 8 : invoice.vat_rate === 10 ? 10 : 0);
    setEditError("");
    setEditInfoOpen(true);
  }

  async function handleSaveInvoiceInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!editCustName.trim() || !editCustPhone.trim()) {
      setEditError("Vui lòng nhập tên người liên hệ và số điện thoại.");
      return;
    }

    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`/api/internal/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_invoice_info",
          customer: {
            name: editCustName.trim(),
            phone: editCustPhone.trim(),
            company_name: editCompanyName.trim(),
            tax_id: editTaxId.trim(),
            address: editAddress.trim(),
          },
          vat_rate: editVatRate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật thông tin phiếu thanh toán");
      }

      setEditInfoOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDownloadColorImage() {
    if (!invoice) return;
    setExportingImage(true);
    try {
      if (docMode !== "color") {
        setDocMode("color");
        await new Promise((resolve) => window.setTimeout(resolve, 90));
      }
      if (document.fonts?.ready) await document.fonts.ready;
      const sheet = document.getElementById("invoice-print-area");
      if (sheet) {
        const imgs = Array.from(sheet.querySelectorAll("img"));
        await Promise.all(imgs.map((img) => img.decode?.().catch(() => undefined)));
      }
      const safeCustomer = invoice.customer.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      const ok = await generateQuoteImage(
        "invoice-print-area",
        `PhieuThu_${invoice.invoice_number}_${safeCustomer || "KhachHang"}.jpg`
      );
      if (!ok) {
        alert("Chưa thể tạo ảnh phiếu thanh toán. Anh/chị vui lòng thử lại.");
      }
    } finally {
      setExportingImage(false);
    }
  }

  async function handlePrintInvoice() {
    if (docMode !== "bw") {
      setDocMode("bw");
      await new Promise((resolve) => window.setTimeout(resolve, 90));
    }
    document.body.classList.add("invoice-printing");
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("invoice-printing"),
      { once: true }
    );
    window.print();
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
        <Link href="/quanly/invoices" className="quanly-btn-secondary inline-flex">
          ← Quay lại danh sách phiếu
        </Link>
      </div>
    );
  }

  const canRecordPayment = invoice.status === "issued" && invoice.balance > 0;
  const canEditInfo = invoice.status !== "cancelled";
  const canCancelInvoice = invoice.status === "issued" && invoice.paid_amount === 0;
  const actionCount =
    (canRecordPayment ? 1 : 0) + (canEditInfo ? 1 : 0) + 2 + (canCancelInvoice ? 1 : 0);
  const isBw = docMode === "bw";
  const vatRate = invoice.vat_rate || 0;
  const itemsSubtotal = invoice.items.reduce((sum, item) => sum + item.total_price, 0);
  const subtotalAmount = invoice.subtotal_amount || itemsSubtotal || invoice.total_amount;
  const vatAmount =
    invoice.vat_amount !== undefined
      ? invoice.vat_amount
      : vatRate > 0
        ? Math.max(0, invoice.total_amount - subtotalAmount)
        : 0;
  const previewVatAmount = Math.round(subtotalAmount * (editVatRate / 100));
  const previewTotalAmount = subtotalAmount + previewVatAmount;

  return (
    <div className="quanly-content-container max-w-5xl">
      {/* Action Bar (Hidden when printing) */}
      <div className="print:hidden quanly-page-header">
        <div className="quanly-page-title-group flex flex-wrap items-center gap-2">
          <Link
            href="/quanly/invoices"
            className="text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 inline-flex items-center"
          >
            ← Danh sách phiếu
          </Link>
          <span className="font-mono text-sm font-bold text-[#d4af37]">
            {invoice.invoice_number}
          </span>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
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

        <div className="quanly-action-bar">
          {canRecordPayment && (
            <button
              type="button"
              onClick={() => {
                setPayAmount(invoice.balance);
                setPayModalOpen(true);
              }}
              className={`quanly-btn-primary ${actionCount % 2 === 1 ? "quanly-action-span-full" : ""}`}
            >
              <span>＋</span> Ghi nhận thu tiền
            </button>
          )}

          {canEditInfo && (
            <button
              type="button"
              onClick={openEditInfoModal}
              className={`quanly-btn-secondary ${!canRecordPayment && actionCount % 2 === 1 ? "quanly-action-span-full" : ""}`}
            >
              🏢 Sửa Công ty / VAT
            </button>
          )}

          <button
            type="button"
            disabled={exportingImage}
            onClick={() => void handleDownloadColorImage()}
            className="quanly-btn-secondary disabled:opacity-50"
          >
            {exportingImage ? "Đang xuất ảnh..." : "▧ Lưu ảnh màu (Zalo)"}
          </button>

          <button
            type="button"
            onClick={() => void handlePrintInvoice()}
            className="quanly-btn-gold"
          >
            🖨 In trắng đen (A4)
          </button>

          {canCancelInvoice && (
            <button
              type="button"
              onClick={handleCancelInvoice}
              className="quanly-btn-danger"
              title="Hủy phiếu thanh toán (Chỉ Owner)"
            >
              Hủy phiếu
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-[#141923] p-3">
        <div
          className="grid grid-cols-2 sm:inline-flex gap-1.5 rounded-xl bg-[#0b0e14] p-1 border border-white/10"
          role="group"
          aria-label="Chế độ hiển thị phiếu thanh toán"
        >
          <button
            type="button"
            onClick={() => setDocMode("color")}
            aria-pressed={!isBw}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              !isBw
                ? "bg-[#174f48] text-white border border-[#d4af37]/50 shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎨 Bản màu (Lưu ảnh)
          </button>
          <button
            type="button"
            onClick={() => setDocMode("bw")}
            aria-pressed={isBw}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              isBw
                ? "bg-white text-black font-bold shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🖨 Bản in trắng đen
          </button>
        </div>
        <p className="text-[11px] text-gray-400">
          {isBw
            ? "Đang xem bản in trắng đen chữ sắc nét, không nền màu."
            : "Đang xem bản màu chuẩn A4 để lưu ảnh gửi khách qua Zalo."}
        </p>
      </div>

      {/* Mobile Swipe Hint */}
      <p className="print:hidden text-center text-[11px] text-amber-300/90 md:hidden">
        ← Vuốt ngang để xem toàn bộ phiếu A4 →
      </p>

      {/* Printable & Exportable A4 Sheet Wrapper */}
      <div className="quanly-table-scroll rounded-xl bg-gray-900 p-3 sm:p-6 print:bg-white print:p-0 print:overflow-visible">
        <div
          id="invoice-print-area"
          data-print-mode={docMode}
          className={`relative mx-auto overflow-hidden bg-white p-9 text-[13.5px] leading-[1.5] font-normal shadow-2xl print:shadow-none print:m-0 ${
            isBw ? "text-black" : "text-[#1e293b]"
          }`}
          style={{
            width: "794px",
            minHeight: "1050px",
            fontFamily: "var(--font-be-vietnam), Arial, sans-serif",
          }}
        >
          {/* Subtle Watermark (Color Mode Only) */}
          {!isBw && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] print:hidden"
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo_sgm.png" alt="" className="w-[340px] h-[340px] object-contain" />
            </div>
          )}

          <div className="relative z-10 flex flex-col min-h-[970px] space-y-5">
            {/* Child 1: Branding Header */}
            {isBw ? (
              <div className="flex items-center justify-between gap-4 border-b-[3px] border-double border-black pb-4 bg-white text-black">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-[70px] w-[70px] shrink-0 grid place-items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo_sgm.png"
                      alt="Saigon Motor"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[20px] font-extrabold uppercase tracking-[0.06em] text-black leading-tight">
                      SAIGON MOTOR
                    </h2>
                    <p className="mt-0.5 text-[11px] font-bold uppercase text-black">
                      Công ty TNHH Ô tô Xe máy 368
                    </p>
                    <p className="mt-1 text-[10.5px] text-black">
                      <strong>MST:</strong> 0316339254 &nbsp;•&nbsp; <strong>Hotline:</strong> 0704 104 104
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-black">
                      <strong>Đ/c:</strong> 745 Phạm Văn Đồng, KP. 8, P. Hiệp Bình, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="shrink-0 border-2 border-black bg-white px-4 py-2.5 text-right text-black">
                  <h1 className="text-[15px] font-extrabold uppercase tracking-wider text-black">
                    PHIẾU THANH TOÁN
                  </h1>
                  <p className="text-[10px] text-black">(Biên nhận dịch vụ pháp lý xe)</p>
                  <div className="mt-1 font-mono text-[13px] font-bold text-black">
                    Số: {invoice.invoice_number}
                  </div>
                  <div className="text-[10.5px] text-black">
                    Ngày: {formatDate(invoice.issued_at || invoice.created_at)}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="overflow-hidden rounded-2xl text-white shadow-md"
                style={{
                  background: "linear-gradient(135deg, #0b111c 0%, #122b30 52%, #174f48 100%)",
                }}
              >
                <div className="flex items-center justify-between gap-4 px-5 py-5">
                  <div className="flex items-center gap-4 min-w-0 flex-1 pr-2">
                    <div
                      className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-2xl p-2"
                      style={{
                        backgroundColor: "#0b0e14",
                        border: "1.5px solid rgba(243, 210, 122, 0.55)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/logo_sgm_gold.png"
                        alt="Saigon Motor"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[20px] font-extrabold uppercase tracking-[0.06em] text-white leading-none">
                        SAIGON MOTOR
                      </h2>
                      <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-[#f3d27a]">
                        Công ty TNHH Ô tô Xe máy 368
                      </p>
                      <p className="mt-1 text-[10.5px] text-[#e2efec]">
                        <span className="font-semibold text-white">MST:</span> 0316339254 &nbsp;•&nbsp;{" "}
                        <span className="font-semibold text-white">Hotline/Zalo:</span> 0704 104 104
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-[#cfe3de]">
                        <span className="font-semibold text-white">Đ/c:</span> 745 Phạm Văn Đồng, KP. 8, P. Hiệp Bình, TP. Hồ Chí Minh
                      </p>
                    </div>
                  </div>

                  <div
                    className="shrink-0 rounded-xl px-4 py-3 text-right"
                    style={{
                      backgroundColor: "rgba(11, 14, 20, 0.72)",
                      border: "1px solid rgba(243, 210, 122, 0.45)",
                    }}
                  >
                    <h1 className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#f3d27a]">
                      PHIẾU THANH TOÁN
                    </h1>
                    <p className="text-[10px] text-[#d5e7e2]">(Biên nhận dịch vụ pháp lý xe)</p>
                    <div className="mt-1 font-mono text-[15px] font-extrabold text-white whitespace-nowrap">
                      {invoice.invoice_number}
                    </div>
                    <div className="text-[10.5px] text-[#d5e7e2]">
                      Ngày: {formatDate(invoice.issued_at || invoice.created_at)}
                    </div>
                  </div>
                </div>
                <div
                  className="h-[4px] w-full"
                  style={{
                    background: "linear-gradient(90deg, #b58e24 0%, #f8e49b 50%, #b58e24 100%)",
                  }}
                />
              </div>
            )}

            {/* Child 2: Customer & Transaction Cards */}
            <div className="grid grid-cols-2 gap-4 text-[12.5px]">
              <div
                className={
                  isBw
                    ? "border border-black bg-white p-3.5 text-black space-y-1"
                    : "rounded-xl border border-[#d5e2dc] border-l-4 border-l-[#174f48] bg-[#f7faf9] p-4 space-y-1"
                }
              >
                <div
                  className={`mb-2 pb-1 text-[11px] font-bold uppercase tracking-wide ${
                    isBw ? "border-b border-black text-black" : "border-b border-[#c5d6cf] text-[#174f48]"
                  }`}
                >
                  Khách hàng / Đơn vị thanh toán
                </div>
                {invoice.customer.company_name ? (
                  <>
                    <div className="font-bold text-[14px] leading-snug">
                      {invoice.customer.company_name}
                    </div>
                    {invoice.customer.tax_id && (
                      <div className="font-mono text-[12px]">
                        <span className={isBw ? "text-black" : "text-[#536761]"}>Mã số thuế (MST):</span>{" "}
                        <span className="font-bold">{invoice.customer.tax_id}</span>
                      </div>
                    )}
                    <div>
                      <span className={isBw ? "text-black" : "text-[#536761]"}>Người liên hệ:</span>{" "}
                      <span className="font-semibold">{invoice.customer.name}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-[14px]">{invoice.customer.name}</div>
                    {invoice.customer.tax_id && (
                      <div className="font-mono text-[12px]">
                        <span className={isBw ? "text-black" : "text-[#536761]"}>Mã số thuế (MST):</span>{" "}
                        <span className="font-bold">{invoice.customer.tax_id}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="font-mono text-[12px]">
                  <span className={isBw ? "text-black" : "text-[#536761]"}>Điện thoại:</span>{" "}
                  <span className="font-semibold">{invoice.customer.phone}</span>
                </div>
                {invoice.customer.address && (
                  <div>
                    <span className={isBw ? "text-black" : "text-[#536761]"}>Địa chỉ:</span>{" "}
                    {invoice.customer.address}
                  </div>
                )}
              </div>

              <div
                className={
                  isBw
                    ? "border border-black bg-white p-3.5 text-black space-y-1"
                    : "rounded-xl border border-[#e6dec3] border-l-4 border-l-[#d4af37] bg-[#fcfbf7] p-4 space-y-1.5"
                }
              >
                <div
                  className={`mb-2 pb-1 text-[11px] font-bold uppercase tracking-wide ${
                    isBw ? "border-b border-black text-black" : "border-b border-[#dfd4b2] text-[#8a6a14]"
                  }`}
                >
                  Thông tin giao dịch
                </div>
                {invoice.case_number && (
                  <div>
                    <span className={isBw ? "text-black" : "text-[#536761]"}>Mã hồ sơ gốc:</span>{" "}
                    <span className="font-mono font-bold">{invoice.case_number}</span>
                  </div>
                )}
                {invoice.due_date && (
                  <div>
                    <span className={isBw ? "text-black" : "text-[#536761]"}>Hạn thanh toán:</span>{" "}
                    <span className="font-semibold">{invoice.due_date}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={isBw ? "text-black" : "text-[#536761]"}>Trạng thái:</span>
                  {isBw ? (
                    <span className="border border-black px-2 py-0.5 text-[11px] font-bold uppercase text-black">
                      {invoice.status === "cancelled"
                        ? "Đã hủy"
                        : invoice.balance === 0
                          ? "Đã thu đủ 100%"
                          : "Còn công nợ"}
                    </span>
                  ) : (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{
                        backgroundColor:
                          invoice.status === "cancelled"
                            ? "#ffe4e6"
                            : invoice.balance === 0
                              ? "#d1fae5"
                              : "#fef3c7",
                        color:
                          invoice.status === "cancelled"
                            ? "#9f1239"
                            : invoice.balance === 0
                              ? "#065f46"
                              : "#92400e",
                      }}
                    >
                      {invoice.status === "cancelled"
                        ? "Phiếu đã hủy"
                        : invoice.balance === 0
                          ? "✓ Đã thu đủ 100%"
                          : "Còn công nợ chưa thu đủ"}
                    </span>
                  )}
                </div>
                {invoice.notes && (
                  <div className={`italic text-[12px] ${isBw ? "text-black" : "text-[#475569]"}`}>
                    Ghi chú: {invoice.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Child 3: Services Items Table */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3
                  className={`text-[13px] font-bold uppercase tracking-wide ${
                    isBw ? "text-black" : "text-[#174f48]"
                  }`}
                >
                  Chi tiết dịch vụ thanh toán
                </h3>
                <span className={`text-[11px] font-semibold ${isBw ? "text-black" : "text-[#536761]"}`}>
                  Đơn vị tính: VNĐ
                </span>
              </div>

              <table
                className={`w-full border-collapse text-left text-[12.5px] ${
                  isBw ? "border border-black text-black" : "border border-[#b9ccc6] text-[#1e293b]"
                }`}
              >
                <thead>
                  <tr
                    className={
                      isBw
                        ? "border-t-2 border-b-2 border-black bg-white text-black"
                        : "bg-[#133f3a] text-white"
                    }
                  >
                    <th className={`w-10 py-2.5 px-2.5 text-center text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      STT
                    </th>
                    <th className={`py-2.5 px-3 text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Tên dịch vụ pháp lý thực hiện
                    </th>
                    <th className={`w-28 py-2.5 px-2.5 text-right text-[11px] font-bold whitespace-nowrap ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Đơn giá
                    </th>
                    <th className={`w-12 py-2.5 px-2 text-center text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      SL
                    </th>
                    <th className={`w-32 py-2.5 px-2.5 text-right text-[11px] font-bold whitespace-nowrap ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className={isBw ? "bg-white" : idx % 2 === 0 ? "bg-white" : "bg-[#f5f9f7]"}
                    >
                      <td className={`py-2.5 px-2.5 text-center ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {idx + 1}
                      </td>
                      <td className={`py-2.5 px-3 font-semibold ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {item.item_name}
                      </td>
                      <td className={`py-2.5 px-2.5 font-mono text-right whitespace-nowrap ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {formatMoney(item.unit_price)}
                      </td>
                      <td className={`py-2.5 px-2 font-mono text-center ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {item.quantity}
                      </td>
                      <td className={`py-2.5 px-2.5 font-mono text-right font-bold whitespace-nowrap ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {formatMoney(item.total_price)}
                      </td>
                    </tr>
                  ))}
                  {(vatRate > 0 || vatAmount > 0) && (
                    <>
                      <tr className="bg-white">
                        <td
                          colSpan={4}
                          className={`py-2 px-3 text-right font-medium ${isBw ? "border border-black text-black" : "border border-[#cddad5] text-[#40534e]"}`}
                        >
                          Cộng tiền dịch vụ (Trước thuế):
                        </td>
                        <td className={`py-2 px-2.5 font-mono text-right font-semibold whitespace-nowrap ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                          {formatMoney(subtotalAmount)}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td
                          colSpan={4}
                          className={`py-2 px-3 text-right font-medium ${isBw ? "border border-black text-black" : "border border-[#cddad5] text-[#40534e]"}`}
                        >
                          Thuế GTGT (VAT {vatRate}%):
                        </td>
                        <td className={`py-2 px-2.5 font-mono text-right font-semibold whitespace-nowrap ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                          {formatMoney(vatAmount)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Child 4: Financial Summary Box + Amount in Words */}
            {isBw ? (
              <div className="border-2 border-black bg-white p-3.5 text-black space-y-2 text-[12.5px]">
                {(vatRate > 0 || vatAmount > 0) && (
                  <>
                    <div className="flex justify-between gap-4 border-b border-black pb-1.5">
                      <span className="font-medium">Cộng tiền dịch vụ (Trước thuế):</span>
                      <span className="font-mono font-bold whitespace-nowrap">{formatMoney(subtotalAmount)}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-black pb-1.5">
                      <span className="font-medium">Thuế GTGT (VAT {vatRate}%):</span>
                      <span className="font-mono font-bold whitespace-nowrap">{formatMoney(vatAmount)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between gap-4 border-b border-black pb-1.5">
                  <span className="font-medium">Tổng cộng thanh toán:</span>
                  <span className="font-mono font-bold whitespace-nowrap">{formatMoney(invoice.total_amount)}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-black pb-1.5">
                  <span className="font-medium">Số tiền đã thanh toán:</span>
                  <span className="font-mono font-bold whitespace-nowrap">{formatMoney(invoice.paid_amount)}</span>
                </div>
                <div className="flex justify-between gap-4 text-[14.5px] font-extrabold pt-0.5">
                  <span className="uppercase">Còn lại phải thu (Công nợ):</span>
                  <span className="font-mono whitespace-nowrap">{formatMoney(invoice.balance)}</span>
                </div>
                <p className="border-t border-black pt-1.5 text-[11.5px] italic">
                  <strong>Tổng giá trị dịch vụ bằng chữ:</strong> {formatMoneyToVietnameseWords(invoice.total_amount)}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-4 items-stretch">
                <div className="col-span-7 rounded-xl border border-[#d5e2dc] bg-[#f7faf9] p-4 flex flex-col justify-between text-[12px]">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-[#174f48] mb-1.5">
                      Xác nhận giá trị bằng chữ
                    </div>
                    <p className="text-[#1e293b]">
                      <span className="text-[#536761]">Tổng cộng thanh toán:</span>{" "}
                      <strong className="font-semibold italic">
                        {formatMoneyToVietnameseWords(invoice.total_amount)}.
                      </strong>
                    </p>
                    {invoice.paid_amount > 0 && (
                      <p className="mt-1 text-[#065f46]">
                        <span className="text-[#536761]">Đã thanh toán:</span>{" "}
                        <strong className="font-semibold italic">
                          {formatMoneyToVietnameseWords(invoice.paid_amount)}.
                        </strong>
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#d5e2dc] flex items-center justify-between text-[11px] text-[#536761]">
                    <span>Hình thức: Tiền mặt / Chuyển khoản công ty</span>
                    <span className="font-bold uppercase text-[#174f48]">
                      {invoice.balance === 0 ? "★ ĐÃ THANH TOÁN ĐỦ" : "⏳ THEO DÕI CÔNG NỢ"}
                    </span>
                  </div>
                </div>

                <div
                  className="col-span-5 rounded-xl p-4 text-white flex flex-col justify-between"
                  style={{
                    background: "linear-gradient(135deg, #0e1522 0%, #174f48 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                  }}
                >
                  <div className="space-y-1.5 text-[12px]">
                    {(vatRate > 0 || vatAmount > 0) && (
                      <>
                        <div className="flex justify-between gap-2 text-[#cfe3de]">
                          <span>Tiền dịch vụ (Trước thuế):</span>
                          <span className="font-mono font-semibold text-white whitespace-nowrap">
                            {formatMoney(subtotalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2 text-[#f3d27a]">
                          <span>Thuế GTGT (VAT {vatRate}%):</span>
                          <span className="font-mono font-semibold whitespace-nowrap">
                            {formatMoney(vatAmount)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between gap-2 text-[#cfe3de]">
                      <span>Tổng cộng thanh toán:</span>
                      <span className="font-mono font-semibold text-white whitespace-nowrap">
                        {formatMoney(invoice.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 text-[#6ee7b7]">
                      <span>Đã thanh toán:</span>
                      <span className="font-mono font-bold whitespace-nowrap">
                        {formatMoney(invoice.paid_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/15 flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#f3d27a]">
                      {invoice.balance === 0 ? "Công nợ còn:" : "Phải thu thêm:"}
                    </span>
                    <span className="font-mono text-[19px] font-extrabold text-[#f8e49b] whitespace-nowrap">
                      {formatMoney(invoice.balance)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Child 5 (Conditional): Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="space-y-2 text-[12px]">
                <h4
                  className={`font-bold text-[11.5px] uppercase tracking-wide ${
                    isBw ? "text-black" : "text-[#174f48]"
                  }`}
                >
                  Lịch sử các lần nhận tiền
                </h4>
                <div className="space-y-1.5">
                  {invoice.payments.map((p) => (
                    <div
                      key={p.id}
                      className={
                        isBw
                          ? "flex flex-wrap items-center justify-between gap-2 border border-black bg-white px-3 py-2 text-[11.5px] text-black"
                          : "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#d5e2dc] bg-[#f7faf9] px-3 py-2 text-[11.5px]"
                      }
                    >
                      <div className="min-w-0">
                        <span className="font-bold">
                          {p.payment_method === "cash"
                            ? "Tiền mặt"
                            : p.payment_method === "bank_transfer"
                              ? "Chuyển khoản"
                              : "Khác"}
                        </span>{" "}
                        • {formatDate(p.payment_date)}
                        {p.reference_code && (
                          <span className={`ml-1.5 ${isBw ? "text-black" : "text-[#536761]"}`}>
                            (Mã GD: {p.reference_code})
                          </span>
                        )}
                        {p.notes && (
                          <span className={`ml-1.5 italic ${isBw ? "text-black" : "text-[#536761]"}`}>
                            — {p.notes}
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-mono font-bold whitespace-nowrap shrink-0 ${
                          isBw ? "text-black" : "text-[#047857]"
                        }`}
                      >
                        +{formatMoney(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatures & Footer Strip */}
            <div className="mt-auto space-y-5">
              <div
                className={`pt-6 grid grid-cols-2 gap-8 text-center text-[12px] ${
                  isBw ? "border-t border-black text-black" : "border-t border-[#d5e2dc] text-[#334155]"
                }`}
              >
                <div>
                  <div className="font-bold uppercase text-[11.5px]">Người lập phiếu</div>
                  <div className="text-[10.5px]">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16" aria-hidden="true" />
                  <div className="font-bold">Phạm Xuân Định</div>
                </div>
                <div>
                  <div className="font-bold uppercase text-[11.5px]">Khách hàng ký nhận</div>
                  <div className="text-[10.5px]">(Ký và ghi rõ họ tên)</div>
                  <div className="h-16" aria-hidden="true" />
                  <div className="font-bold">{invoice.customer.name}</div>
                </div>
              </div>

              <div
                className={`pt-2.5 text-center text-[10px] ${
                  isBw ? "border-t border-black text-black" : "border-t border-[#e2ece8] text-[#536761]"
                }`}
              >
                Saigon Motor — 745 Phạm Văn Đồng, KP. 8, P. Hiệp Bình, TP. Hồ Chí Minh • Hotline/Zalo: 0704 104 104 • saigonmotor.vn
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Record Payment */}
      {payModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordPayment}
            className="bg-[#121620] border border-gray-800 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90dvh] overflow-y-auto"
          >
            <h3 className="text-base font-bold text-white">💰 Ghi nhận Thu tiền Khách hàng</h3>
            <p className="text-xs text-gray-400">
              Công nợ hiện tại:{" "}
              <span className="font-mono font-bold text-amber-400">{formatMoney(invoice.balance)}</span>
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

            <div className="quanly-action-bar pt-2">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="quanly-btn-secondary"
              >
                Hủy
              </button>
              <button type="submit" disabled={paySubmitting} className="quanly-btn-primary">
                {paySubmitting ? "Đang lưu..." : "✓ Xác nhận đã thu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Update Company Info & VAT */}
      {editInfoOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveInvoiceInfo}
            className="bg-[#121620] border border-gray-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90dvh] overflow-y-auto"
          >
            <div>
              <h3 className="text-base font-bold text-white">
                🏢 Cập nhật Thông tin Công ty & VAT
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Thông tin này sẽ hiển thị ngay trên bản in A4 và ảnh gửi Zalo của phiếu{" "}
                <span className="font-mono text-[#d4af37]">{invoice.invoice_number}</span>.
              </p>
            </div>

            {editError && (
              <div
                role="alert"
                className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-xs text-red-300"
              >
                ⚠️ {editError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">
                  Tên người liên hệ / Khách hàng *
                </label>
                <input
                  type="text"
                  required
                  value={editCustName}
                  onChange={(e) => setEditCustName(e.target.value)}
                  className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={editCustPhone}
                  onChange={(e) => setEditCustPhone(e.target.value)}
                  className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">
                  Tên công ty / Đơn vị
                </label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  placeholder="Công ty TNHH / Cổ phần..."
                  className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Mã số thuế (MST)</label>
                <input
                  type="text"
                  value={editTaxId}
                  onChange={(e) => setEditTaxId(e.target.value)}
                  placeholder="03xxxxxxxx"
                  className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-gray-300 mb-1">
                Địa chỉ công ty / khách hàng
              </label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã, tỉnh/thành phố..."
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-2 pt-1 border-t border-gray-800">
              <span className="block text-[11px] text-gray-300">Thuế GTGT (VAT) áp dụng:</span>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Cập nhật mức thuế VAT">
                <button
                  type="button"
                  aria-pressed={editVatRate === 0}
                  onClick={() => setEditVatRate(0)}
                  className={`min-h-[38px] px-2 py-2 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
                    editVatRate === 0
                      ? "border-[#d4af37] bg-[#d4af37]/15 text-[#f3d27a]"
                      : "border-gray-800 bg-[#0d1017] text-gray-400 hover:text-white"
                  }`}
                >
                  Không VAT
                </button>
                <button
                  type="button"
                  aria-pressed={editVatRate === 8}
                  onClick={() => setEditVatRate(8)}
                  className={`min-h-[38px] px-2 py-2 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
                    editVatRate === 8
                      ? "border-[#d4af37] bg-[#d4af37]/20 text-[#f3d27a]"
                      : "border-gray-800 bg-[#0d1017] text-gray-400 hover:text-white"
                  }`}
                >
                  VAT 8%
                </button>
                <button
                  type="button"
                  aria-pressed={editVatRate === 10}
                  onClick={() => setEditVatRate(10)}
                  className={`min-h-[38px] px-2 py-2 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
                    editVatRate === 10
                      ? "border-[#d4af37] bg-[#d4af37]/20 text-[#f3d27a]"
                      : "border-gray-800 bg-[#0d1017] text-gray-400 hover:text-white"
                  }`}
                >
                  VAT 10%
                </button>
              </div>
              <div className="rounded-lg bg-black/40 border border-gray-800 p-2.5 text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Tiền dịch vụ (Trước thuế):</span>
                  <span className="font-mono text-gray-200">{formatMoney(subtotalAmount)}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>Thuế GTGT (VAT {editVatRate}%):</span>
                  <span className="font-mono">{formatMoney(previewVatAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-gray-800">
                  <span>Tổng cộng mới:</span>
                  <span className="font-mono">{formatMoney(previewTotalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="quanly-action-bar pt-2">
              <button
                type="button"
                onClick={() => setEditInfoOpen(false)}
                className="quanly-btn-secondary"
              >
                Đóng
              </button>
              <button type="submit" disabled={editSubmitting} className="quanly-btn-primary">
                {editSubmitting ? "Đang lưu..." : "✓ Lưu thông tin"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
