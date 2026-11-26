"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ManagementSidebar from "./ManagementSidebar";
import ManagementHeader from "./ManagementHeader";
import {
  IconCases,
  IconDashboard,
  IconInvoices,
  IconMenu,
  IconQuotes,
} from "./QuanlyIcons";

export default function ManagementShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [staffInfo, setStaffInfo] = useState<{
    name: string | null;
    email: string | null;
    role: string | null;
  }>({ name: null, email: null, role: null });

  useEffect(() => {
    let ignore = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setStaffInfo({
            name: data.profile?.full_name || null,
            email: data.user?.email || null,
            role: data.profile?.role || null,
          });
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  const isMenuRouteActive =
    pathname?.startsWith("/quanly/customers") ||
    pathname?.startsWith("/quanly/costs") ||
    pathname?.startsWith("/quanly/leads") ||
    pathname?.startsWith("/quanly/services") ||
    pathname?.startsWith("/quanly/settings");

  return (
    <div className="quanly-shell">
      <ManagementSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={staffInfo.role}
      />
      <div className="quanly-main">
        <ManagementHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          staffName={staffInfo.name}
          staffEmail={staffInfo.email}
          userRole={staffInfo.role}
        />
        <main className="p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Fixed 5-item Mobile App Navigation Dock */}
      <nav className="quanly-mobile-nav" aria-label="Điều hướng nhanh trên điện thoại">
        <Link
          href="/quanly"
          className={pathname === "/quanly" ? "quanly-mobile-nav-item is-active" : "quanly-mobile-nav-item"}
        >
          <IconDashboard className="w-[18px] h-[18px] shrink-0" />
          <span>Tổng quan</span>
        </Link>
        <Link
          href="/quanly/quotes"
          className={pathname?.startsWith("/quanly/quotes") ? "quanly-mobile-nav-item is-active" : "quanly-mobile-nav-item"}
        >
          <IconQuotes className="w-[18px] h-[18px] shrink-0" />
          <span>Báo giá</span>
        </Link>
        <Link
          href="/quanly/cases"
          className={pathname?.startsWith("/quanly/cases") ? "quanly-mobile-nav-item is-active" : "quanly-mobile-nav-item"}
        >
          <IconCases className="w-[18px] h-[18px] shrink-0" />
          <span>Hồ sơ</span>
        </Link>
        <Link
          href="/quanly/invoices"
          className={pathname?.startsWith("/quanly/invoices") ? "quanly-mobile-nav-item is-active" : "quanly-mobile-nav-item"}
        >
          <IconInvoices className="w-[18px] h-[18px] shrink-0" />
          <span>Phiếu thu</span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-expanded={sidebarOpen}
          className={sidebarOpen || isMenuRouteActive ? "quanly-mobile-nav-item is-active" : "quanly-mobile-nav-item"}
        >
          <IconMenu className="w-[18px] h-[18px] shrink-0" />
          <span>Mở rộng</span>
        </button>
      </nav>
    </div>
  );
}
