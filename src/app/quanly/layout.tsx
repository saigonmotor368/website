"use client";

import { useEffect, useState } from "react";
import ManagementSidebar from "./components/ManagementSidebar";
import ManagementHeader from "./components/ManagementHeader";
import "./quanly.css";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
