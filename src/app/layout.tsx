import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800", "900"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Saigon Motor | Dịch Vụ Hồ Sơ, Sang Tên, Rút Gốc Ô Tô Xe Máy Uy Tín",
  description: "Saigon Motor (Công ty TNHH Ô tô Xe máy 368) với hơn 10 năm kinh nghiệm, chuyên cung cấp dịch vụ rút hồ sơ gốc, sang tên đổi chủ, đăng ký xe ô tô, xe máy trọn gói, uy tín và nhanh chóng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${playfair.variable} ${lora.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
