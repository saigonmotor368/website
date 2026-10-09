"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CaseSummary {
  id: string;
  case_number: string;
  status: "new" | "processing" | "completed";
  customer: {
    name: string;
    phone: string;
    type?: string;
    company_name?: string;
    zalo_name?: string;
  };
  vehicles: Array<{
    license_plate?: string;
    brand?: string;
    model?: string;
    fleet_description?: string;
    vehicle_count?: number;
  }>;
  items: Array<{
    service_name: string;
    quoted_price: number;
    adjusted_price: number;
    final_price: number;
  }>;
  documents: Array<{
    document_name: string;
    status: "required" | "received" | "missing";
  }>;
  estimated_amount: number;
  final_amount: number;
  is_locked: boolean;
  assigned_name?: string;
  received_at: string;
}

const statusConfig = {
  new: { label: "Mới tiếp nhận", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  processing: { label: "Đang xử lý", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  completed: { label: "Hoàn thành", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
};

function formatMoney(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export default function CasesListPage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    async function loadCases() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (searchQuery) params.set("q", searchQuery);

        const res = await fetch(`/api/internal/cases?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setCases(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) console.warn("Lỗi tải hồ sơ:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = window.setTimeout(() => void loadCases(), searchQuery ? 300 : 0);
    return () => {
      ignore = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [statusFilter, searchQuery]);

  // Counts for tabs
  const countAll = cases.length;
  const countNew = cases.filter((c) => c.status === "new").length;
  const countProcessing = cases.filter((c) => c.status === "processing").length;
  const countCompleted = cases.filter((c) => c.status === "completed").length;

  return (
    <div className="quanly-content-container">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            📂 Quản lý Hồ sơ Thực hiện
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Theo dõi tiến độ thực hiện dịch vụ xe, kiểm tra checklist giấy tờ và nghiệm thu giá
          </p>
        </div>

        <Link
          href="/quanly/cases/create"
          className="quanly-btn-primary self-start sm:self-auto text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
        >
          <span>＋</span> Tiếp nhận hồ sơ mới
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#121620] p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === ""
                ? "bg-[#1c2233] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Tất cả ({countAll})
          </button>
          <button
            onClick={() => setStatusFilter("new")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === "new"
                ? "bg-blue-900/40 text-blue-300 shadow-sm border border-blue-700/50"
                : "text-gray-400 hover:text-blue-400"
            }`}
          >
            Mới tiếp nhận ({countNew})
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === "processing"
                ? "bg-amber-900/40 text-amber-300 shadow-sm border border-amber-700/50"
                : "text-gray-400 hover:text-amber-400"
            }`}
          >
            Đang xử lý ({countProcessing})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === "completed"
                ? "bg-emerald-900/40 text-emerald-300 shadow-sm border border-emerald-700/50"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            Hoàn thành ({countCompleted})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative min-w-[280px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã HS, tên khách, SĐT, biển số..."
            className="w-full bg-[#121620] border border-gray-800 rounded-xl pl-8 pr-8 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Cases Table */}
      <div className="quanly-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase text-gray-500 bg-black/40 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Mã hồ sơ</th>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Phương tiện</th>
                <th className="px-5 py-3.5">Giấy tờ</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Giá trị thực hiện</th>
                <th className="px-5 py-3.5">Ngày nhận</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    Đang tải danh sách hồ sơ...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    Chưa có hồ sơ nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const badge = statusConfig[c.status] || statusConfig.new;
                  const primaryVehicle = c.vehicles[0];
                  const receivedDocs = c.documents.filter((d) => d.status === "received").length;
                  const totalDocs = c.documents.length;
                  const isAdjusted = c.final_amount !== c.estimated_amount;

                  return (
                    <tr key={c.id} className="hover:bg-gray-800/20 transition">
                      <td className="px-5 py-4 font-mono font-medium text-white text-xs">
                        <Link
                          href={`/quanly/cases/${c.id}`}
                          className="text-[#d4af37] hover:underline flex items-center gap-1.5 font-bold"
                        >
                          {c.case_number}
                        </Link>
                        {c.is_locked && (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/50">
                            🔒 Đã khóa nghiệm thu
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-xs">
                          {c.customer.name}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          {c.customer.phone}
                          {c.customer.zalo_name && (
                            <span className="text-[#38bdf8] ml-1">({c.customer.zalo_name})</span>
                          )}
                        </div>
                        {c.customer.company_name && (
                          <div className="text-[10px] text-gray-500 truncate max-w-[180px]">
                            🏢 {c.customer.company_name}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {primaryVehicle?.license_plate ? (
                          <div>
                            <span className="font-mono font-bold text-gray-200 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">
                              {primaryVehicle.license_plate}
                            </span>
                            <div className="text-[11px] text-gray-400 mt-1">
                              {primaryVehicle.brand} {primaryVehicle.model}
                            </div>
                          </div>
                        ) : primaryVehicle?.fleet_description ? (
                          <div>
                            <span className="font-medium text-amber-300">
                              🚚 {primaryVehicle.fleet_description}
                            </span>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              Số lượng: {primaryVehicle.vehicle_count || 1} xe
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Chưa có thông tin xe</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              receivedDocs === totalDocs && totalDocs > 0
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          >
                            {receivedDocs}/{totalDocs}
                          </span>
                          <span className="text-gray-500 text-[11px]">đã nhận</span>
                        </div>
                        <div className="w-20 bg-gray-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              receivedDocs === totalDocs && totalDocs > 0
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${totalDocs > 0 ? (receivedDocs / totalDocs) * 100 : 0}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span
                          className={`px-2.5 py-1 rounded-full font-medium ${badge.bg} ${badge.text} border ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs">
                        <div className="font-bold text-emerald-400 text-sm">
                          {formatMoney(c.final_amount)}
                        </div>
                        {isAdjusted ? (
                          <div className="text-[10px] text-amber-400/80 line-through">
                            Gốc: {formatMoney(c.estimated_amount)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500">
                            {c.items.length} dịch vụ
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-400">
                        <div>{formatDate(c.received_at)}</div>
                        <div className="text-[10px] text-gray-500">
                          {c.assigned_name || "Phạm Xuân Định"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/quanly/cases/${c.id}`}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700 transition"
                          >
                            Xử lý →
                          </Link>
                          {c.status === "completed" && (
                            <Link
                              href={`/quanly/invoices/create?caseId=${c.id}`}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60 transition"
                              title="Xuất phiếu thanh toán cho khách"
                            >
                              Tạo phiếu
                            </Link>
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
