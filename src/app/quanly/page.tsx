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
        const [reportsRes, quotesRes, casesRes] = await Promise.all([
          fetch("/api/internal/reports"),
          fetch("/api/internal/quotes"),
          fetch("/api/internal/cases"),
        ]);

        if (ignore) return;

        if (reportsRes.ok) {
          const repData = await reportsRes.json();
          if (repData.metrics) {
            setMetrics(repData.metrics);
          }
        }

        if (quotesRes.ok) {
          const qData = await quotesRes.json();
          if (Array.isArray(qData)) {
            setRecentQuotes(qData.slice(0, 5));
          }
        }

        if (casesRes.ok) {
          const cData = await casesRes.json();
          if (Array.isArray(cData)) {
            setRecentCases(cData.slice(0, 5));
          }
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
    <div className="quanly-content-container space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            📊 Tổng quan Quản lý Dịch vụ Xe
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Số liệu thực tế đồng bộ từ Supabase: doanh thu, tiền thu, chi phí và hồ sơ
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/quanly/quotes/create" className="quanly-btn-gold text-xs sm:text-sm">
            <span>+ Tạo Báo Giá</span>
          </Link>
          <Link href="/quanly/cases/create" className="quanly-btn-primary text-xs sm:text-sm">
            <span>+ Tiếp Nhận Hồ Sơ</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats Grid (Desktop: 4 columns, Tablet: 2 cols, Mobile: 1 col) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Issued Revenue */}
        <div className="quanly-card border-l-4 border-l-[#d4af37]">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>DOANH THU ĐÃ PHÁT HÀNH</span>
            <span className="text-base">🧾</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-2 font-mono">
            {loading ? "..." : formatMoney(metrics.issuedRevenue)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Từ các phiếu thanh toán có hiệu lực
          </div>
        </div>

        {/* Metric 2: Collected Money */}
        <div className="quanly-card border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>TIỀN ĐÃ THU THỰC TẾ</span>
            <span className="text-base">💵</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2 font-mono">
            {loading ? "..." : formatMoney(metrics.collectedMoney)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Công nợ còn: <span className="text-amber-400 font-mono font-semibold">{formatMoney(metrics.pendingDebt)}</span>
          </div>
        </div>

        {/* Metric 3: Approved Costs */}
        <div className="quanly-card border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>CHI PHÍ ĐÃ PHÊ DUYỆT</span>
            <span className="text-base">📉</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-2 font-mono">
            {loading ? "..." : formatMoney(metrics.approvedCosts)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Lệ phí nhà nước & công tác phí đã duyệt
          </div>
        </div>

        {/* Metric 4: Net Profit */}
        <div className="quanly-card border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>LỢI NHUẬN GỘP THỰC TẾ</span>
            <span className="text-base">📈</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-sky-400 mt-2 font-mono">
            {loading ? "..." : formatMoney(metrics.netProfit)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Doanh thu − Chi phí đã duyệt
          </div>
        </div>
      </div>

      {/* Secondary Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-black/30 border border-gray-800/80 rounded-xl">
          <span className="text-[11px] text-gray-400 block">Tổng số báo giá</span>
          <span className="text-lg font-bold text-white font-mono">{metrics.totalQuotes}</span>
        </div>
        <div className="p-3 bg-black/30 border border-gray-800/80 rounded-xl">
          <span className="text-[11px] text-gray-400 block">Hồ sơ đang xử lý</span>
          <span className="text-lg font-bold text-amber-400 font-mono">{metrics.activeCases}</span>
        </div>
        <div className="p-3 bg-black/30 border border-gray-800/80 rounded-xl">
          <span className="text-[11px] text-gray-400 block">Hồ sơ hoàn thành</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">{metrics.completedCases}</span>
        </div>
        <div className="p-3 bg-black/30 border border-gray-800/80 rounded-xl">
          <span className="text-[11px] text-gray-400 block">Quy tắc phân chia</span>
          <span className="text-sm font-semibold text-[#d4af37] block mt-0.5">50% Chủ HT / 50% Quỹ</span>
        </div>
      </div>

      {/* 2-Column Split: Recent Quotes vs Active Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="quanly-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📝</span> Báo giá phát hành gần đây
            </h2>
            <Link href="/quanly/quotes" className="text-xs text-[#d4af37] hover:underline">
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
                <div key={q.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                      <span className="font-mono text-[#d4af37]">{q.quote_number}</span>
                      <span className="text-gray-400">•</span>
                      <span className="truncate">{q.customer_name}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      {q.customer_phone} • {formatDate(q.created_at)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-emerald-400">
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📂</span> Hồ sơ đang xử lý gần đây
            </h2>
            <Link href="/quanly/cases" className="text-xs text-[#d4af37] hover:underline">
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
                <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                      <Link
                        href={`/quanly/cases/${c.id}`}
                        className="font-mono text-[#d4af37] hover:underline"
                      >
                        {c.case_number}
                      </Link>
                      <span className="text-gray-400">•</span>
                      <span className="truncate">{c.customer.name}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                      {c.customer.phone} • {formatDate(c.created_at)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-emerald-400">
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
