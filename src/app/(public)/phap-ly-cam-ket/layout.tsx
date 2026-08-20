import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pháp Lý & Cam Kết | Saigon Motor",
  description: "Hồ sơ pháp lý và cam kết chất lượng dịch vụ của Saigon Motor (Công ty TNHH Oto Xe Máy 368). Bảo mật 100%, không phát sinh chi phí.",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
