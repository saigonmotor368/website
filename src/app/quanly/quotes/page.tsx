"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface QuoteListItem {
  id: string;
  quote_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  company_name?: string | null;
  vehicle_plate?: string | null;
  vehicle_desc?: string | null;
  total_amount: number;
  services_count: number;
  case_id?: string | null;
  created_at: string;
}

const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
  issued: { label: "Đã phát hành", bg: "bg-emerald-950/60", text: "text-emerald-400" },
  draft: { label: "Bản nháp", bg: "bg-gray-800", text: "text-gray-300" },
  accepted: { label: "Đã chấp nhận", bg: "bg-blue-950/60", text: "text-blue-400" },
  rejected: { label: "Từ chối", bg: "bg-rose-950/60", text: "text-rose-400" },
  expired: { label: "Hết hạn", bg: "bg-amber-950/60", text: "text-amber-400" },
};

export default function QuanlyQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [canDeleteQuotes, setCanDeleteQuotes] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadQuotes = async (status = "", q = "") => {
    setLoading(true);
    setLoadError("");
    try {
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
      if (q) qs.set("q", q);
      const res = await fetch(`/api/internal/quotes?${qs.toString()}`, {
        cache: "no-store",
      });
      setCanDeleteQuotes(res.headers.get("x-can-delete-quotes") === "true");
      if (res.ok) {
        const data = await res.json();
        setQuotes(data || []);
      } else {
        const data = await res.json().catch(() => null);
        setQuotes([]);
        setLoadError(data?.error || "Không thể tải danh sách báo giá.");
      }
    } catch (err) {
      console.error("Lỗi tải báo giá:", err);
      setQuotes([]);
      setLoadError("Không thể kết nối để tải danh sách báo giá.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/internal/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setQuotes((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái báo giá:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteRejectedQuote = async (quote: QuoteListItem) => {
    if (quote.status !== "rejected" || quote.case_id) return;
    const confirmed = window.confirm(
      `Xóa báo giá ${quote.quote_number} của ${quote.customer_name}?\n\nChỉ báo giá bị từ chối mới được xóa. Thao tác này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setDeletingId(quote.id);
    try {
      const res = await fetch(`/api/internal/quotes/${encodeURIComponent(quote.id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        window.alert(data?.error || "Không thể xóa báo giá.");
        return;
      }
      setQuotes((current) => current.filter((item) => item.id !== quote.id));
    } catch {
      window.alert("Không thể kết nối để xóa báo giá. Danh sách chưa bị thay đổi.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadQuotes(statusFilter, searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="quanly-content-container">
      {/* Header */}
      <div className="quanly-page-header">
        <div className="quanly-page-title-group">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            📝 Quản lý Báo giá Dịch vụ
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Lập, xem trước khổ A4, phát hành và theo dõi phản hồi của khách hàng.
          </p>
        </div>
        <div className="quanly-action-bar quanly-action-bar-single">
          <Link href="/quanly/quotes/create" className="quanly-btn-gold">
            <span>+ Tạo Báo Giá Mới</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="quanly-card !p-3.5 sm:!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center bg-[#0d1017] border border-gray-800 rounded-xl px-3 py-2.5 min-w-0">
            <span className="text-gray-500 mr-2 shrink-0">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo số báo giá, tên khách, SĐT, biển số xe..."
              className="bg-transparent w-full min-w-0 text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa từ khóa"
                className="text-gray-500 hover:text-white text-xs shrink-0 pl-2"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-52 bg-[#0d1017] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="issued">Đã phát hành</option>
            <option value="draft">Bản nháp</option>
            <option value="accepted">Đã chấp nhận</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Mobile Cards List */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="quanly-card text-center py-10 text-xs text-gray-500">
            Đang tải danh sách báo giá...
          </div>
        ) : loadError ? (
          <div className="quanly-card text-center py-8 space-y-3">
            <div className="font-semibold text-rose-300 text-xs">{loadError}</div>
            <button
              type="button"
              onClick={() => void loadQuotes(statusFilter, searchQuery)}
              className="quanly-btn-danger !text-xs"
            >
              Tải lại danh sách
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="quanly-card text-center py-10 text-xs text-gray-500">
            Chưa có báo giá nào phù hợp với bộ lọc.
          </div>
        ) : (
          quotes.map((q) => {
            const badge = statusBadges[q.status] || statusBadges.issued;
            return (
              <article key={q.id} className="quanly-mobile-card">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/quanly/quotes/create?edit=${q.id}`}
                    className="font-mono text-sm font-bold text-[#d4af37] hover:underline truncate"
                  >
                    {q.quote_number}
                  </Link>
                  <span
                    className={`shrink-0 inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium leading-none ${badge.bg} ${badge.text} border border-current/20`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">{q.customer_name}</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">{q.customer_phone}</div>
                    {q.company_name && (
                      <div className="text-[11px] text-purple-300 truncate mt-0.5">{q.company_name}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums font-bold text-emerald-400 text-sm">
                      {formatMoney(q.total_amount)}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {q.services_count} dịch vụ · {formatDate(q.created_at)}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <span>Phương tiện:</span>
                  {q.vehicle_plate ? (
                    <span className="font-mono px-2 py-0.5 rounded bg-black/40 border border-gray-700 text-gray-200">
                      {q.vehicle_plate}
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">Không có xe cụ thể</span>
                  )}
                </div>

                <div className="quanly-action-bar pt-1">
                  <Link href={`/quanly/quotes/create?edit=${q.id}`} className="quanly-btn-secondary !py-2 !text-xs">
                    Chi tiết / Sửa
                  </Link>

                  {q.case_id ? (
                    <Link href={`/quanly/cases/${q.case_id}`} className="quanly-btn-primary !py-2 !text-xs">
                      📂 Xem hồ sơ
                    </Link>
                  ) : (
                    <Link href={`/quanly/cases/create?quoteId=${q.id}`} className="quanly-btn-gold !py-2 !text-xs">
                      Lập hồ sơ →
                    </Link>
                  )}

                  {q.status === "issued" && (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === q.id}
                        onClick={() => handleUpdateStatus(q.id, "accepted")}
                        className="quanly-btn-secondary !py-2 !text-xs !border-blue-800/50 !text-blue-300 disabled:opacity-50"
                      >
                        ✓ Chấp nhận
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === q.id}
                        onClick={() => handleUpdateStatus(q.id, "rejected")}
                        className="quanly-btn-danger !py-2 !text-xs disabled:opacity-50"
                      >
                        ✕ Từ chối
                      </button>
                    </>
                  )}

                  {q.status === "rejected" && canDeleteQuotes && (
                    <button
                      type="button"
                      disabled={deletingId === q.id || Boolean(q.case_id)}
                      onClick={() => void handleDeleteRejectedQuote(q)}
                      className="quanly-btn-danger quanly-action-span-full !py-2 !text-xs disabled:opacity-50"
                    >
                      {deletingId === q.id ? "Đang xóa..." : "🗑 Xóa báo giá"}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Desktop Quotes Table */}
      <div className="quanly-card !p-0 overflow-hidden hidden md:block">
        <div className="quanly-table-scroll" tabIndex={0} role="region" aria-label="Danh sách báo giá">
          <table className="w-full min-w-[900px] text-left text-sm text-gray-300">
            <thead className="text-xs uppercase text-gray-500 bg-black/30 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">Mã báo giá</th>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Phương tiện</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Trạng thái</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Tổng tiền</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Ngày tạo</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Đang tải danh sách báo giá...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center">
                    <div className="font-semibold text-rose-300">{loadError}</div>
                    <button
                      type="button"
                      onClick={() => void loadQuotes(statusFilter, searchQuery)}
                      className="mt-3 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-500/10"
                    >
                      Tải lại danh sách
                    </button>
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Chưa có báo giá nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                quotes.map((q) => {
                  const badge = statusBadges[q.status] || statusBadges.issued;
                  return (
                    <tr key={q.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-mono font-bold whitespace-nowrap">
                        <Link
                          href={`/quanly/quotes/create?edit=${q.id}`}
                          className="inline-flex whitespace-nowrap rounded text-[#d4af37] underline-offset-4 transition hover:text-[#f1cf55] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
                          title={`Mở chi tiết báo giá ${q.quote_number}`}
                          aria-label={`Mở chi tiết báo giá ${q.quote_number}`}
                        >
                          {q.quote_number}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{q.customer_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{q.customer_phone}</div>
                        {q.company_name && (
                          <div className="text-[11px] text-purple-300 truncate max-w-xs">
                            {q.company_name}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {q.vehicle_plate ? (
                          <>
                            <span className="inline-flex whitespace-nowrap font-mono px-2 py-0.5 rounded bg-black/40 border border-gray-700 text-gray-200">
                              {q.vehicle_plate}
                            </span>
                            {q.vehicle_desc && (
                              <div className="text-gray-500 text-[11px] mt-0.5">{q.vehicle_desc}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Không có xe cụ thể</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap">
                        <span
                          className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full font-medium leading-none ${badge.bg} ${badge.text} border border-current/20`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono tabular-nums font-bold text-emerald-400 whitespace-nowrap">
                        {formatMoney(q.total_amount)}
                        <div className="text-[10px] text-gray-500 font-normal">
                          {q.services_count} dịch vụ
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(q.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {q.case_id ? (
                            <Link
                              href={`/quanly/cases/${q.case_id}`}
                              className="text-xs px-2.5 py-1.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 hover:bg-blue-900/60 flex items-center gap-1"
                              title="Xem hồ sơ thực hiện liên kết"
                            >
                              📂 Hồ sơ
                            </Link>
                          ) : (
                            <Link
                              href={`/quanly/cases/create?quoteId=${q.id}`}
                              className="text-xs px-2.5 py-1.5 rounded bg-teal-950/60 border border-teal-800/40 text-teal-300 hover:bg-teal-900/60"
                              title="Chuyển báo giá này thành hồ sơ xử lý thực tế"
                            >
                              Lập hồ sơ →
                            </Link>
                          )}

                          {q.status === "issued" && (
                            <>
                              <button
                                type="button"
                                disabled={updatingId === q.id}
                                onClick={() => handleUpdateStatus(q.id, "accepted")}
                                className="text-[11px] px-2.5 py-1.5 rounded bg-blue-950/40 border border-blue-800/40 text-blue-300 hover:bg-blue-900/60 disabled:opacity-50"
                                title="Đánh dấu khách hàng đã đồng ý"
                              >
                                ✓ Chấp nhận
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === q.id}
                                onClick={() => handleUpdateStatus(q.id, "rejected")}
                                className="text-[11px] px-2.5 py-1.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 disabled:opacity-50"
                                title="Đánh dấu khách hàng từ chối"
                              >
                                ✕ Từ chối
                              </button>
                            </>
                          )}
                          {q.status === "rejected" && canDeleteQuotes && (
                            <button
                              type="button"
                              disabled={deletingId === q.id || Boolean(q.case_id)}
                              onClick={() => void handleDeleteRejectedQuote(q)}
                              className="text-[11px] px-2.5 py-1.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 disabled:cursor-not-allowed disabled:opacity-50"
                              title={q.case_id ? "Báo giá đã gắn với hồ sơ, không thể xóa" : "Xóa báo giá bị khách từ chối"}
                            >
                              {deletingId === q.id ? "Đang xóa..." : "🗑 Xóa"}
                            </button>
                          )}
                        </div>
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
