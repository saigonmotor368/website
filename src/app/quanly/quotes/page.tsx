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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Báo giá Dịch vụ</h1>
          <p className="text-gray-400 text-sm mt-1">
            Lập, xem trước khổ A4, phát hành và theo dõi phản hồi của khách hàng.
          </p>
        </div>
        <Link href="/quanly/quotes/create" className="quanly-btn-gold">
          <span>+ Tạo Báo Giá Mới</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="quanly-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="flex-1 flex items-center bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2">
            <span className="text-gray-500 mr-2">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo số báo giá, tên khách, SĐT, biển số xe..."
              className="bg-transparent w-full text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="issued">Đã phát hành</option>
            <option value="draft">Bản nháp</option>
            <option value="accepted">Đã chấp nhận</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="quanly-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase text-gray-500 bg-black/30 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Mã báo giá</th>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Phương tiện</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Tổng tiền</th>
                <th className="px-5 py-3.5">Ngày tạo</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
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
                      <td className="px-5 py-4 font-mono font-bold text-[#d4af37]">
                        {q.quote_number}
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
                            <span className="font-mono px-2 py-0.5 rounded bg-black/40 border border-gray-700 text-gray-200">
                              {q.vehicle_plate}
                            </span>
                            {q.vehicle_desc && (
                              <div className="text-gray-500 text-[11px] mt-0.5">
                                {q.vehicle_desc}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Không có xe cụ thể</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span
                          className={`px-2.5 py-1 rounded-full font-medium ${badge.bg} ${badge.text} border border-current/20`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                        {formatMoney(q.total_amount)}
                        <div className="text-[10px] text-gray-500 font-normal">
                          {q.services_count} dịch vụ
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {formatDate(q.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link
                            href={`/quanly/quotes/create?edit=${q.id}`}
                            className="text-xs px-2.5 py-1 rounded bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
                            title="Chỉnh sửa hoặc xuất PDF A4"
                          >
                            Xem / Sửa
                          </Link>

                          {q.case_id ? (
                            <Link
                              href={`/quanly/cases/${q.case_id}`}
                              className="text-xs px-2.5 py-1 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 hover:bg-blue-900/60 flex items-center gap-1"
                              title="Xem hồ sơ thực hiện liên kết"
                            >
                              📂 Hồ sơ
                            </Link>
                          ) : (
                            <Link
                              href={`/quanly/cases/create?quoteId=${q.id}`}
                              className="text-xs px-2.5 py-1 rounded bg-teal-950/60 border border-teal-800/40 text-teal-300 hover:bg-teal-900/60"
                              title="Chuyển báo giá này thành hồ sơ xử lý thực tế"
                            >
                              Lập hồ sơ →
                            </Link>
                          )}

                          {q.status === "issued" && (
                            <>
                              <button
                                disabled={updatingId === q.id}
                                onClick={() => handleUpdateStatus(q.id, "accepted")}
                                className="text-[11px] px-2 py-1 rounded bg-blue-950/40 border border-blue-800/40 text-blue-300 hover:bg-blue-900/60 disabled:opacity-50"
                                title="Đánh dấu khách hàng đã đồng ý"
                              >
                                ✓ Chấp nhận
                              </button>
                              <button
                                disabled={updatingId === q.id}
                                onClick={() => handleUpdateStatus(q.id, "rejected")}
                                className="text-[11px] px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 disabled:opacity-50"
                                title="Đánh dấu khách hàng từ chối"
                              >
                                ✕ Từ chối
                              </button>
                            </>
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
