import type { Metadata, Viewport } from "next";
import ManagementShell from "./components/ManagementShell";
import "./quanly.css";

export const metadata: Metadata = {
  title: { absolute: "Saigon Motor" },
  applicationName: "Saigon Motor",
  description: "Hệ thống quản lý hồ sơ và dịch vụ pháp lý xe Saigon Motor.",
  manifest: "/quanly.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Saigon Motor",
    statusBarStyle: "black-translucent",
  },
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return <ManagementShell>{children}</ManagementShell>;
}
