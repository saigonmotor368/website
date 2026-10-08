"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProfitReportData {
  metrics: {
    issuedRevenue: number;
    collectedMoney: number;
    pendingDebt: number;
    approvedCosts: number;
    netProfit: number;
  };
  profitAllocations: Array<{
    beneficiary_name: string;
    role: string;
    percentage: number;
    allocated_amount: number;
  }>;
  costs: Array<{
    id: string;
    case_id: string;
    case_number: string;
    customer_name: string;
    cost_group: string;
    description: string;
    amount: number;
    incurred_date: string;
    status: "draft" | "approved" | "rejected";
    submitted_by?: string;
    approved_by?: string;
  }>;
}

function formatMoney(amount: number): string {
  return (amount || 0).toLocaleString("vi-VN") + "đ";
}

export default function CostsAndProfitPage() {
  const [data, setData] = useState<ProfitReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [costGroupFilter, setCostGroupFilter] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadReport() {
      try {
        const res = await fetch("/api/internal/reports");
        if (res.ok) {
          const json = await res.json();
          if (!ignore) setData(json);
        }
      } catch (err) {
        console.warn("Lỗi tải báo cáo tài chính:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadReport();
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  function reloadReport() {
    setRefreshKey((k) => k + 1);
  }

  async function handleApproveCost(caseId: string, costId: string, approveStatus: "approved" | "rejected") {
    try {
      const res = await fetch(`/api/internal/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_cost",
          cost_id: costId,
          approve_status: approveStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Không thể duyệt chi phí");
        return;
      }

      await reloadReport();
    } catch {
      alert("Lỗi kết nối");
    }
  }

  if (loading || !data) {
    return (
      <div className="quanly-content-container text-center py-20 text-gray-400">
        Đang nạp dữ liệu chi phí và lợi nhuận...
      </div>
    );
  }

  const { metrics, profitAllocations, costs } = data;
  const filteredCosts = costGroupFilter
    ? costs.filter((c) => c.cost_group === costGroupFilter)
    : costs;

  return (
    <div className="quanly-content-container space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          💰 Chi phí & Phân chia Lợi nhuận
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Báo cáo doanh thu, duyệt chi phí hồ sơ và phân chia lợi nhuận thực tế (50/50 mặc định)
        </p>
      </div>

      {/* 4 Big KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Doanh thu phát hành</div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1">
            {formatMoney(metrics.issuedRevenue)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Đã xuất phiếu thanh toán</div>
        </div>

        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Tiền thực thu</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatMoney(metrics.collectedMoney)}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Tiền mặt & Chuyển khoản</div>
        </div>

        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Chi phí thực tế đã duyệt</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            {formatMoney(metrics.approvedCosts)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Lệ phí nhà nước & công tác</div>
        </div>

        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Lợi nhuận gộp thực tế</div>
          <div className="text-xl font-bold font-mono text-[#d4af37] mt-1">
            {formatMoney(metrics.netProfit)}
          </div>
          <div className="text-[10px] text-[#d4af37]/80 mt-0.5">Doanh thu - Chi phí duyệt</div>
        </div>
      </div>

      {/* 50/50 Profit Split Allocation Box */}
      <div className="quanly-card border-[#d4af37]/30 bg-gradient-to-br from-[#121620] to-[#1a1c12] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🤝</span> Phân chia Lợi nhuận Thực tế (Cấu hình mặc định 50/50)
            </h2>
            <p className="text-[11px] text-gray-400">
              Dựa trên lợi nhuận gộp thực tế: {formatMoney(metrics.netProfit)} sau khi trừ chi phí đã được duyệt
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-[#d4af37]/10 text-[#d4af37] font-semibold border border-[#d4af37]/20">
            Tỷ lệ chia: 50% - 50%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profitAllocations.map((beneficiary, idx) => (
            <div
              key={idx}
              className="p-4 bg-black/40 border border-gray-800 rounded-xl space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">
                    {beneficiary.beneficiary_name}
                  </div>
                  <div className="text-[11px] text-gray-400">{beneficiary.role}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center font-bold text-xs">
                  {beneficiary.percentage}%
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800/80">
                <div className="text-[10px] text-gray-400">Số tiền phân bổ thực nhận:</div>
                <div className="text-lg font-mono font-extrabold text-[#d4af37]">
                  {formatMoney(beneficiary.allocated_amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Costs List Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📋</span> Danh sách Toàn bộ Chi phí Phát sinh
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={costGroupFilter}
              onChange={(e) => setCostGroupFilter(e.target.value)}
              className="bg-[#121620] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="">Tất cả nhóm chi phí</option>
              <option value="Lệ phí nhà nước">Lệ phí nhà nước</option>
              <option value="Công tác phí">Công tác phí</option>
              <option value="Chi phí hồ sơ">Chi phí hồ sơ</option>
            </select>
          </div>
        </div>

        <div className="quanly-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase text-gray-500 bg-black/40 border-b border-gray-800">
                <tr>
                  <th className="px-5 py-3">Hồ sơ</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Nhóm chi phí</th>
                  <th className="px-5 py-3">Mô tả</th>
                  <th className="px-5 py-3 font-mono">Số tiền</th>
                  <th className="px-5 py-3">Ngày phát sinh</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs">
                {filteredCosts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500">
                      Chưa có chi phí nào.
                    </td>
                  </tr>
                ) : (
                  filteredCosts.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-800/20 transition">
                      <td className="px-5 py-3.5 font-mono text-[#d4af37]">
                        <Link
                          href={`/quanly/cases/${c.case_id}`}
                          className="hover:underline"
                        >
                          {c.case_number}
                        </Link>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-white">
                        {c.customer_name}
                      </td>

                      <td className="px-5 py-3.5 text-gray-400">{c.cost_group}</td>

                      <td className="px-5 py-3.5 text-gray-200">{c.description}</td>

                      <td className="px-5 py-3.5 font-mono font-bold text-rose-400">
                        {formatMoney(c.amount)}
                      </td>

                      <td className="px-5 py-3.5 text-gray-400">{c.incurred_date}</td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            c.status === "approved"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                              : c.status === "rejected"
                              ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                              : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                          }`}
                        >
                          {c.status === "approved"
                            ? "✓ Đã duyệt"
                            : c.status === "rejected"
                            ? "✕ Từ chối"
                            : "Bản nháp"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {c.status !== "approved" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveCost(c.case_id, c.id, "approved")}
                              className="px-2 py-1 bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 rounded text-[11px] hover:bg-emerald-900/60"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleApproveCost(c.case_id, c.id, "rejected")}
                              className="px-2 py-1 bg-rose-950/60 border border-rose-800/40 text-rose-300 rounded text-[11px] hover:bg-rose-900/60"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
