"use client";

import { useRouter } from "next/navigation";

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
        : "rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-gray-400";

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
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
          aria-label="Mở menu"
        >
          ☰
        </button>
        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
          Hệ thống Quản lý Dịch vụ Hồ sơ Xe Saigon Motor
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User profile details */}
        <div className="text-right">
          <div className="text-xs font-bold text-white flex items-center justify-end gap-2">
            <span>{staffName || staffEmail || "Nhân sự SGM"}</span>
            <span className={roleClass}>{roleLabel}</span>
          </div>
          {staffEmail && staffName && (
            <div className="text-[11px] text-gray-400 font-mono">{staffEmail}</div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
