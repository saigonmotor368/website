"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userRole?: string | null;
}

const navItems = [
  { href: "/quanly", label: "Tổng quan", icon: "📊" },
  { href: "/quanly/quotes", label: "Báo giá dịch vụ", icon: "📝" },
  { href: "/quanly/cases", label: "Hồ sơ thực hiện", icon: "📂" },
  { href: "/quanly/customers", label: "Khách hàng", icon: "👥" },
  { href: "/quanly/invoices", label: "Phiếu thanh toán", icon: "🧾" },
  { href: "/quanly/costs", label: "Chi phí & Lợi nhuận", icon: "💰" },
  { href: "/quanly/leads", label: "Khách tiềm năng", icon: "🎯" },
  { href: "/quanly/services", label: "Danh mục dịch vụ", icon: "📋" },
  { href: "/quanly/settings", label: "Cài đặt hệ thống", icon: "⚙️", ownerOnly: true },
];

export default function ManagementSidebar({ open, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
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

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside className={open ? "quanly-sidebar mobile-open" : "quanly-sidebar"}>
        {/* Brand logo */}
        <div className="quanly-sidebar-logo">
          <Image
            src="/logo_sgm.png"
            alt="Saigon Motor"
            width={38}
            height={38}
            className="object-contain"
          />
          <div className="flex-1 min-w-0">
            <span className="block font-bold text-white text-sm tracking-wide leading-tight">
              SAIGON MOTOR
            </span>
            <span className="block text-[11px] text-[#d4af37] font-semibold">
              Hệ thống Quản lý
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="quanly-nav-list">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Phân hệ nghiệp vụ
          </div>

          {navItems
            .filter((item) => !item.ownerOnly || userRole === "owner")
            .map((item) => {
            const isActive =
              item.href === "/quanly"
                ? pathname === "/quanly"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={isActive ? "quanly-nav-item active" : "quanly-nav-item"}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Công cụ hỗ trợ
          </div>

          <Link
            href="/"
            className="quanly-nav-item text-xs text-gray-400 hover:text-white"
            target="_blank"
          >
            <span className="text-base">🌐</span>
            <span>Trang web chính</span>
          </Link>
        </nav>

        {/* User role bottom info */}
        <div className="p-4 border-t border-white/5 bg-black/20 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Quyền truy cập:</span>
            <span className={roleClass}>{roleLabel}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
