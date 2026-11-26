"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface InvoiceSummary {
  id: string;
  invoice_number: string;
  case_id?: string;
  case_number?: string;
  customer: {
    name: string;
    phone: string;
    company_name?: string;
  };
  status: "draft" | "issued" | "cancelled";
  issued_at?: string;
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  created_at: string;
}

const statusConfig = {
  issued: { label: "Đã phát hành", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  draft: { label: "Bản nháp", bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
  cancelled: { label: "Đã hủy", bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
};

function formatMoney(amount: number): string {
  return (amount || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    async function loadInvoices() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (searchQuery) params.set("q", searchQuery);

        const res = await fetch(`/api/internal/invoices?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setInvoices(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) console.warn("Lỗi tải phiếu thanh toán:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = window.setTimeout(() => void loadInvoices(), searchQuery ? 300 : 0);
    return () => {
      ignore = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [statusFilter, searchQuery]);

  const totalIssued = invoices
    .filter((i) => i.status !== "cancelled")
    .reduce((sum, i) => sum + i.total_amount, 0);
  const totalPaid = invoices
    .filter((i) => i.status !== "cancelled")
    .reduce((sum, i) => sum + i.paid_amount, 0);
  const totalDebt = Math.max(0, totalIssued - totalPaid);

  const filterButtons = [
    { value: "", label: `Tất cả (${invoices.length})`, activeClass: "bg-[#1c2233] text-white", idleClass: "text-gray-400 hover:text-white" },
    { value: "issued", label: "Đã phát hành", activeClass: "bg-blue-900/40 text-blue-300", idleClass: "text-gray-400 hover:text-blue-400" },
    { value: "draft", label: "Bản nháp", activeClass: "bg-gray-800 text-gray-200", idleClass: "text-gray-400 hover:text-gray-200" },
    { value: "cancelled", label: "Đã hủy", activeClass: "bg-rose-900/40 text-rose-300", idleClass: "text-gray-400 hover:text-rose-400" },
  ];

  return (
    <div className="quanly-content-container">
      {/* Top Header */}
      <div className="quanly-page-header">
        <div className="quanly-page-title-group">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            🧾 Phiếu Thanh toán / Biên nhận Dịch vụ
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Quản lý phiếu biên nhận thanh toán dịch vụ xe, ghi nhận tiền đặt cọc và theo dõi công nợ
          </p>
        </div>

        <div className="quanly-action-bar quanly-action-bar-single">
          <Link href="/quanly/invoices/create" className="quanly-btn-primary">
            <span>＋</span>
            <span>Lập phiếu thanh toán mới</span>
          </Link>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Tổng doanh thu phát hành</div>
          <div className="text-xl font-bold font-mono tabular-nums text-blue-400 mt-1">
            {formatMoney(totalIssued)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Các phiếu có hiệu lực</div>
        </div>

        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Tiền thực tế đã thu</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {formatMoney(totalPaid)}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Tiền mặt &amp; Chuyển khoản</div>
        </div>

        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Công nợ còn lại cần thu</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {formatMoney(totalDebt)}
          </div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">Khách chưa hoàn tất</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="bg-[#121620] p-1 rounded-xl border border-gray-800 min-w-0">
          <div className="quanly-scroll-tabs" role="group" aria-label="Lọc trạng thái phiếu thanh toán">
            {filterButtons.map((btn) => {
              const active = statusFilter === btn.value;
              return (
                <button
                  key={btn.value || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={(e) => {
                    setStatusFilter(btn.value);
                    e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    active ? btn.activeClass : btn.idleClass
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative w-full md:w-72 lg:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm số phiếu PT, mã HS, tên khách, SĐT..."
            className="w-full bg-[#121620] border border-gray-800 rounded-xl pl-8 pr-8 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Xóa từ khóa"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Mobile Cards List */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="quanly-card text-center py-10 text-xs text-gray-500">
            Đang tải danh sách phiếu thanh toán...
          </div>
        ) : invoices.length === 0 ? (
          <div className="quanly-card text-center py-10 text-xs text-gray-500">
            Chưa có phiếu thanh toán nào phù hợp với bộ lọc.
          </div>
        ) : (
          invoices.map((inv) => {
            const badge = statusConfig[inv.status] || statusConfig.issued;
            return (
              <article key={inv.id} className="quanly-mobile-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/quanly/invoices/${inv.id}`}
                      className="font-mono text-sm font-bold text-[#d4af37] hover:underline"
                    >
                      {inv.invoice_number}
                    </Link>
                    {inv.case_number && (
                      <Link
                        href={`/quanly/cases/${inv.case_id}`}
                        className="ml-2 text-[11px] font-mono text-gray-400 hover:text-white"
                      >
                        ({inv.case_number})
                      </Link>
                    )}
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${badge.bg} ${badge.text} border ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-white truncate">{inv.customer.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {inv.customer.phone} · {formatDate(inv.issued_at || inv.created_at)}
                  </div>
                  {inv.customer.company_name && (
                    <div className="text-[11px] text-gray-500 truncate mt-0.5">
                      🏢 {inv.customer.company_name}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Tổng tiền</span>
                    <span className="font-mono tabular-nums font-bold text-white">{formatMoney(inv.total_amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Đã thu</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-400">{formatMoney(inv.paid_amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Còn nợ</span>
                    <span className={`font-mono tabular-nums font-bold ${inv.balance > 0 ? "text-amber-400" : "text-gray-500"}`}>
                      {formatMoney(inv.balance)}
                    </span>
                  </div>
                </div>

                <div className="quanly-action-bar quanly-action-bar-single pt-1">
                  <Link href={`/quanly/invoices/${inv.id}`} className="quanly-btn-secondary !py-2 !text-xs">
                    Xem / Thu tiền →
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Desktop Invoices Table */}
      <div className="quanly-card !p-0 overflow-hidden hidden md:block">
        <div className="quanly-table-scroll" tabIndex={0} role="region" aria-label="Danh sách phiếu thanh toán">
          <table className="w-full min-w-[920px] text-left text-sm text-gray-300">
            <thead className="text-xs uppercase text-gray-500 bg-black/40 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">Mã phiếu</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Hồ sơ liên quan</th>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Trạng thái</th>
                <th className="px-5 py-3.5 font-mono whitespace-nowrap">Tổng tiền</th>
                <th className="px-5 py-3.5 font-mono whitespace-nowrap">Đã thu</th>
                <th className="px-5 py-3.5 font-mono whitespace-nowrap">Còn nợ</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Ngày phát hành</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    Đang tải danh sách phiếu thanh toán...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    Chưa có phiếu thanh toán nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const badge = statusConfig[inv.status] || statusConfig.issued;
                  const isFullyPaid = inv.balance === 0 && inv.total_amount > 0;

                  return (
                    <tr key={inv.id} className="hover:bg-gray-800/20 transition">
                      <td className="px-5 py-4 font-mono font-bold text-xs whitespace-nowrap">
                        <Link href={`/quanly/invoices/${inv.id}`} className="text-[#d4af37] hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>

                      <td className="px-5 py-4 font-mono text-gray-400 text-xs whitespace-nowrap">
                        {inv.case_number ? (
                          <Link
                            href={`/quanly/cases/${inv.case_id}`}
                            className="text-gray-300 hover:text-white hover:underline"
                          >
                            {inv.case_number}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{inv.customer.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{inv.customer.phone}</div>
                        {inv.customer.company_name && (
                          <div className="text-[10px] text-gray-500 truncate max-w-[160px]">
                            🏢 {inv.customer.company_name}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full font-medium ${badge.bg} ${badge.text} border ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono tabular-nums font-bold text-white whitespace-nowrap">
                        {formatMoney(inv.total_amount)}
                      </td>

                      <td className="px-5 py-4 font-mono tabular-nums font-semibold text-emerald-400 whitespace-nowrap">
                        {formatMoney(inv.paid_amount)}
                        {isFullyPaid && (
                          <span className="block text-[10px] text-emerald-500 font-normal">✓ Đã thu đủ</span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono tabular-nums font-bold whitespace-nowrap">
                        {inv.balance > 0 ? (
                          <span className="text-amber-400">{formatMoney(inv.balance)}</span>
                        ) : (
                          <span className="text-gray-500">0đ</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                        {formatDate(inv.issued_at || inv.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/quanly/invoices/${inv.id}`}
                          className="inline-flex px-2.5 py-1.5 rounded-lg bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700 transition"
                        >
                          Xem / Thu tiền →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
