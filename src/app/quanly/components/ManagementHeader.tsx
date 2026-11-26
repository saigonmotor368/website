"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconMenu } from "./QuanlyIcons";

interface HeaderProps {
  onToggleSidebar: () => void;
  staffName?: string | null;
  staffEmail?: string | null;
  userRole?: string | null;
}

export default function ManagementHeader({
  onToggleSidebar,
  staffName,
  staffEmail,
  userRole,
}: HeaderProps) {
  const router = useRouter();
  const roleLabel =
    userRole === "owner"
      ? "Chủ hệ thống"
      : userRole === "staff"
        ? "Nhân viên"
        : "Đang tải...";
  const roleClass =
    userRole === "owner"
      ? "quanly-badge-owner"
      : userRole === "staff"
        ? "quanly-badge-staff"
        : "rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-gray-400 whitespace-nowrap";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/dang-nhap-noi-bo");
    router.refresh();
  };

  return (
    <header className="quanly-header">
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 sm:flex-initial">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden min-w-[38px] min-h-[38px] grid place-items-center rounded-xl bg-gray-800/90 border border-white/10 text-gray-200 hover:text-white shrink-0"
          aria-label="Mở menu điều hướng"
        >
          <IconMenu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <span className="quanly-brand-emblem h-7 w-7 p-0.5 lg:hidden">
          <Image
            src="/logo_sgm_gold.png"
            alt="Saigon Motor"
            width={22}
            height={22}
            className="object-contain"
          />
        </span>
        <span className="text-xs font-bold text-[#d4af37] tracking-wide sm:hidden truncate">
          Saigon Motor
        </span>
        <span className="text-xs text-gray-300 font-medium hidden sm:inline truncate">
          Saigon Motor — Quản lý Hồ sơ &amp; Dịch vụ
        </span>
      </div>

      <div className="flex items-center justify-end gap-1.5 sm:gap-3.5 shrink-0 sm:min-w-0 sm:flex-1">
        {/* User profile details */}
        <div className="text-right min-w-0">
          <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5 min-w-0">
            <span className="hidden sm:inline truncate max-w-[210px]">
              {staffName || staffEmail || "Nhân sự SGM"}
            </span>
            <span className={`${roleClass} shrink-0`}>{roleLabel}</span>
          </div>
          {staffEmail && staffName && (
            <div className="hidden sm:block text-[11px] text-gray-400 font-mono truncate">
              {staffEmail}
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 whitespace-nowrap text-[11px] sm:text-xs font-semibold min-h-[34px] sm:min-h-[36px] px-2 sm:px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-800/45 text-red-200 hover:bg-red-900/70 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
