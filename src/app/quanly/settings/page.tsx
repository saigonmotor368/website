"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SystemStatus {
  supabase: { status: "connected" | "error"; label: string };
  gemini: { status: "configured" | "not_configured"; label: string };
  resend: { status: "configured" | "not_configured"; label: string };
  serverTime: string;
  ownerName: string;
}

export default function SystemSettingsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadStatus() {
      try {
        const res = await fetch("/api/internal/system-status");
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Không thể tải thông tin hệ thống");
        }
        const data = await res.json();
        if (!ignore) setStatus(data);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadStatus();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="quanly-content-container text-center py-20 text-gray-400">
        Đang kiểm tra kết nối hệ thống...
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="quanly-content-container py-12 text-center space-y-4">
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 max-w-md mx-auto">
          ⚠️ {error || "Bạn không có quyền truy cập trang này (Chỉ dành cho Chủ hệ thống)."}
        </div>
        <Link href="/quanly" className="quanly-btn-secondary text-xs inline-block">
          ← Quay lại Tổng quan
        </Link>
      </div>
    );
  }

  return (
    <div className="quanly-content-container max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          ⚙️ Cài đặt & Trạng thái Hệ thống
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Khu vực bảo mật dành riêng cho Chủ hệ thống (Phạm Xuân Định) theo dõi kết nối API và hạ tầng
        </p>
      </div>

      {/* Health Checks Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Supabase */}
        <div className="quanly-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">⚡ Supabase Database</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                status.supabase.status === "connected"
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                  : "bg-rose-950/60 text-rose-400 border-rose-800/50"
              }`}
            >
              {status.supabase.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            Cơ sở dữ liệu PostgreSQL và Storage quản lý khách hàng, báo giá, hồ sơ và phiếu thanh toán.
          </p>
        </div>

        {/* Gemini */}
        <div className="quanly-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">🤖 Google Gemini AI</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                status.gemini.status === "configured"
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}
            >
              {status.gemini.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            Dịch vụ AI thị giác máy tính nhận diện và trích xuất giấy đăng ký xe (Cavet) tự động.
          </p>
        </div>

        {/* Resend */}
        <div className="quanly-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">✉️ Resend Email</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                status.resend.status === "configured"
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}
            >
              {status.resend.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            Dịch vụ gửi thông báo email tự động khi có khách hàng tiềm năng gửi yêu cầu tư vấn.
          </p>
        </div>
      </div>

      {/* Security and Environment Policy Info */}
      <div className="quanly-card space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>🔒</span> Nguyên tắc Bảo mật Biến Môi trường
        </h2>

        <div className="p-4 bg-black/40 border border-gray-800 rounded-xl space-y-2 text-xs text-gray-300">
          <div className="font-semibold text-[#d4af37]">
            ✓ Tuyệt đối không nhập khóa API trực tiếp trên giao diện người dùng
          </div>
          <p className="text-[11px] text-gray-400">
            Toàn bộ các khóa bảo mật (API Secrets) được bảo vệ nghiêm ngặt phía server. Không dùng tiền tố <code className="text-amber-300">NEXT_PUBLIC_</code> cho secret key để tránh rò rỉ mã khóa xuống trình duyệt khách.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-2.5 bg-gray-900/60 border border-gray-800 rounded-lg">
              <span className="font-semibold text-white block mb-1">Môi trường Chạy Thử (Local):</span>
              <span className="text-gray-400 text-[11px]">
                Đặt trong file <code className="text-emerald-400 font-mono">.env.local</code> ở thư mục gốc của dự án.
              </span>
            </div>
            <div className="p-2.5 bg-gray-900/60 border border-gray-800 rounded-lg">
              <span className="font-semibold text-white block mb-1">Môi trường Vận hành (Production):</span>
              <span className="text-gray-400 text-[11px]">
                Đặt trong mục <code className="text-emerald-400 font-mono">Environment Variables</code> trên Vercel Dashboard.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Sharing Policy Configuration */}
      <div className="quanly-card space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>⚖️</span> Quy tắc Cấu hình Phân chia Lợi nhuận
        </h2>

        <p className="text-xs text-gray-400">
          Quy tắc phân chia lợi nhuận thực tế (Doanh thu đã phát hành trừ Chi phí thực tế đã được Chủ hệ thống phê duyệt):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-black/40 border border-gray-800 rounded-xl space-y-1">
            <span className="text-xs font-bold text-white block">Phần 1: Chủ hệ thống (Phạm Xuân Định)</span>
            <span className="text-xs font-mono font-bold text-[#d4af37]">Tỷ lệ: 50.00%</span>
            <p className="text-[10px] text-gray-500">
              Quyền quản trị toàn quyền: phê duyệt chi phí, hủy phiếu và cấu hình hệ thống.
            </p>
          </div>

          <div className="p-3.5 bg-black/40 border border-gray-800 rounded-xl space-y-1">
            <span className="text-xs font-bold text-white block">Phần 2: Quỹ Hoạt động & Nhân viên xử lý</span>
            <span className="text-xs font-mono font-bold text-[#d4af37]">Tỷ lệ: 50.00%</span>
            <p className="text-[10px] text-gray-500">
              Phân bổ quỹ hoạt động phát triển hoặc thưởng nhân sự xử lý hồ sơ (Nguyễn Đình Mẫn).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
