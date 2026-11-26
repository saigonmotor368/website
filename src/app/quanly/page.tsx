"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardMetrics {
  totalQuotes: number;
  activeCases: number;
  completedCases: number;
  issuedRevenue: number;
  collectedMoney: number;
  pendingDebt: number;
  approvedCosts: number;
  netProfit: number;
}

interface QuoteItem {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface CaseItem {
  id: string;
  case_number: string;
  customer: { name: string; phone: string };
  status: string;
  final_amount: number;
  created_at: string;
}

export default function QuanlyDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalQuotes: 0,
    activeCases: 0,
    completedCases: 0,
    issuedRevenue: 0,
    collectedMoney: 0,
    pendingDebt: 0,
    approvedCosts: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentQuotes, setRecentQuotes] = useState<QuoteItem[]>([]);
  const [recentCases, setRecentCases] = useState<CaseItem[]>([]);

  useEffect(() => {
    let ignore = false;
    async function loadDashboard() {
      try {
        const response = await fetch("/api/internal/dashboard", { cache: "no-store" });

        if (ignore) return;

        if (response.ok) {
          const data = await response.json();
          if (data.metrics) setMetrics(data.metrics);
          if (Array.isArray(data.recentQuotes)) setRecentQuotes(data.recentQuotes);
          if (Array.isArray(data.recentCases)) setRecentCases(data.recentCases);
        }
      } catch (err) {
        console.error("Lỗi nạp dữ liệu dashboard từ Supabase:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="quanly-content-container">
      {/* Page Header */}
      <div className="quanly-page-header">
        <div className="quanly-page-title-group">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            📊 Tổng quan Quản lý Dịch vụ Xe
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Số liệu thực tế đồng bộ từ Supabase: doanh thu, tiền thu, chi phí và hồ sơ
          </p>
        </div>
        <div className="quanly-action-bar">
          <Link href="/quanly/quotes/create" className="quanly-btn-gold">
            <span>+ Tạo Báo Giá</span>
          </Link>
          <Link href="/quanly/cases/create" className="quanly-btn-primary">
            <span>+ Tiếp Nhận Hồ Sơ</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="quanly-card border-l-4 border-l-[#d4af37]">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold gap-2">
            <span>DOANH THU ĐÃ PHÁT HÀNH</span>
            <span className="text-base shrink-0">🧾</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-2 font-mono tabular-nums">
            {loading ? "..." : formatMoney(metrics.issuedRevenue)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Từ các phiếu thanh toán có hiệu lực
          </div>
        </div>

        <div className="quanly-card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold gap-2">
            <span>TIỀN ĐÃ THU THỰC TẾ</span>
            <span className="text-base shrink-0">💵</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2 font-mono tabular-nums">
            {loading ? "..." : formatMoney(metrics.collectedMoney)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Công nợ còn: <span className="text-amber-400 font-mono tabular-nums font-semibold">{formatMoney(metrics.pendingDebt)}</span>
          </div>
        </div>

        <div className="quanly-card border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold gap-2">
            <span>CHI PHÍ ĐÃ PHÊ DUYỆT</span>
            <span className="text-base shrink-0">📉</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-2 font-mono tabular-nums">
            {loading ? "..." : formatMoney(metrics.approvedCosts)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Lệ phí nhà nước &amp; công tác phí đã duyệt
          </div>
        </div>

        <div className="quanly-card border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold gap-2">
            <span>LỢI NHUẬN GỘP THỰC TẾ</span>
            <span className="text-base shrink-0">📈</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-sky-400 mt-2 font-mono tabular-nums">
            {loading ? "..." : formatMoney(metrics.netProfit)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Doanh thu − Chi phí đã duyệt
          </div>
        </div>
      </div>

      {/* Secondary Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-black/30 border border-gray-800/80 rounded-xl min-w-0">
          <span className="text-[11px] text-gray-400 block">Tổng số báo giá</span>
          <span className="text-lg font-bold text-white font-mono tabular-nums">{metrics.totalQuotes}</span>
        </div>
        <div className="p-3 bg-black/30 border border-gray-800/80 rounded-xl min-w-0">
          <span className="text-[11px] text-gray-400 block">Hồ sơ đang xử lý</span>
          <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">{metrics.activeCases}</span>
        </div>
        <div className="p-3 bg-black/30 border border-gray-800/80 rounded-xl min-w-0">
          <span className="text-[11px] text-gray-400 block">Hồ sơ hoàn thành</span>
          <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">{metrics.completedCases}</span>
        </div>
        <div className="p-3 bg-black/30 border border-gray-800/80 rounded-xl min-w-0">
          <span className="text-[11px] text-gray-400 block">Quy tắc phân chia</span>
          <span className="text-xs sm:text-sm font-semibold text-[#d4af37] block mt-0.5 truncate">50% Chủ HT / 50% Quỹ</span>
        </div>
      </div>

      {/* 2-Column Split: Recent Quotes vs Active Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Quotes */}
        <div className="quanly-card space-y-4">
          <div className="quanly-section-head">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📝</span> Báo giá phát hành gần đây
            </h2>
            <Link href="/quanly/quotes" className="text-xs text-[#d4af37] hover:underline shrink-0">
              Xem tất cả →
            </Link>
          </div>

          <div className="divide-y divide-gray-800/60">
            {recentQuotes.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Chưa có báo giá nào trong hệ thống.
              </div>
            ) : (
              recentQuotes.map((q) => (
                <div key={q.id} className="py-3 flex items-center justify-between gap-3 text-xs min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/quanly/quotes/create?edit=${q.id}`}
                        className="font-mono text-[#d4af37] hover:underline shrink-0"
                      >
                        {q.quote_number}
                      </Link>
                      <span className="text-gray-500 shrink-0">•</span>
                      <span className="truncate">{q.customer_name}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                      {q.customer_phone} • {formatDate(q.created_at)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums font-bold text-emerald-400">
                      {formatMoney(q.total_amount)}
                    </div>
                    <Link
                      href={`/quanly/cases/create?quoteId=${q.id}`}
                      className="text-[11px] text-gray-400 hover:text-white underline mt-0.5 inline-block"
                    >
                      Lập hồ sơ →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Cases */}
        <div className="quanly-card space-y-4">
          <div className="quanly-section-head">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📂</span> Hồ sơ đang xử lý gần đây
            </h2>
            <Link href="/quanly/cases" className="text-xs text-[#d4af37] hover:underline shrink-0">
              Xem tất cả →
            </Link>
          </div>

          <div className="divide-y divide-gray-800/60">
            {recentCases.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Chưa có hồ sơ thực hiện nào được tiếp nhận.
              </div>
            ) : (
              recentCases.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-xs min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/quanly/cases/${c.id}`}
                        className="font-mono text-[#d4af37] hover:underline shrink-0"
                      >
                        {c.case_number}
                      </Link>
                      <span className="text-gray-500 shrink-0">•</span>
                      <span className="truncate">{c.customer.name}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                      {c.customer.phone} • {formatDate(c.created_at)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums font-bold text-emerald-400">
                      {formatMoney(c.final_amount)}
                    </div>
                    <Link
                      href={`/quanly/cases/${c.id}`}
                      className="text-[11px] text-gray-400 hover:text-white underline mt-0.5 inline-block"
                    >
                      Chi tiết →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
