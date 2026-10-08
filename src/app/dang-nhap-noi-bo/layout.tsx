import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập nội bộ",
  description: "Đăng nhập hệ thống quản lý hồ sơ Saigon Motor.",
  manifest: "/quanly.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SGM Quản lý",
    statusBarStyle: "black-translucent",
  },
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#0b3132",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function InternalLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
