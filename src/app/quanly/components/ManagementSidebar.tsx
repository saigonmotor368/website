"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { ComponentType } from "react";
import {
  IconCases,
  IconClose,
  IconCosts,
  IconCustomers,
  IconDashboard,
  IconGlobe,
  IconInvoices,
  IconLeads,
  IconQuotes,
  IconServices,
  IconSettings,
} from "./QuanlyIcons";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userRole?: string | null;
}

const navItems: Array<{
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  ownerOnly?: boolean;
}> = [
  { href: "/quanly", label: "Tổng quan", Icon: IconDashboard },
  { href: "/quanly/quotes", label: "Báo giá dịch vụ", Icon: IconQuotes },
  { href: "/quanly/cases", label: "Hồ sơ thực hiện", Icon: IconCases },
  { href: "/quanly/customers", label: "Khách hàng", Icon: IconCustomers },
  { href: "/quanly/invoices", label: "Phiếu thanh toán", Icon: IconInvoices },
  { href: "/quanly/costs", label: "Chi phí & Lợi nhuận", Icon: IconCosts },
  { href: "/quanly/leads", label: "Khách tiềm năng", Icon: IconLeads },
  { href: "/quanly/services", label: "Danh mục dịch vụ", Icon: IconServices },
  { href: "/quanly/settings", label: "Cài đặt hệ thống", Icon: IconSettings, ownerOnly: true },
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
          aria-hidden="true"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={open ? "quanly-sidebar mobile-open" : "quanly-sidebar"} aria-label="Menu điều hướng quản lý">
        {/* Brand logo */}
        <div className="quanly-sidebar-logo">
          <span className="quanly-brand-emblem h-10 w-10 p-1">
            <Image
              src="/logo_sgm_gold.png"
              alt="Saigon Motor"
              width={34}
              height={34}
              className="object-contain"
            />
          </span>
          <div className="flex-1 min-w-0">
            <span className="block font-bold text-white text-sm tracking-wide leading-tight truncate">
              SAIGON MOTOR
            </span>
            <span className="block text-[11px] text-[#d4af37] font-semibold truncate">
              Hệ thống Quản lý
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="lg:hidden min-w-[40px] min-h-[40px] grid place-items-center rounded-lg bg-white/5 text-gray-300 hover:text-white"
          >
            <IconClose className="w-5 h-5" />
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
              const NavIcon = item.Icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={isActive ? "quanly-nav-item active" : "quanly-nav-item"}
                >
                  <NavIcon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
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
            rel="noopener noreferrer"
          >
            <IconGlobe className="w-[18px] h-[18px] shrink-0" />
            <span>Trang web chính</span>
          </Link>
        </nav>

        {/* User role bottom info */}
        <div className="p-4 border-t border-white/5 bg-black/20 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-400">Quyền truy cập:</span>
            <span className={roleClass}>{roleLabel}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
