import { Inter } from "next/font/google";
import "./bao-gia.css";
import Image from "next/image";
import Link from "next/link";
import AuthWrapper from "./components/AuthWrapper";
import LogoutButton from "./components/LogoutButton";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata = {
  title: "Tạo Báo Giá - Saigon Motor (Internal)",
  description: "Công cụ tạo báo giá nội bộ cho nhân viên Saigon Motor",
};

export default function BaoGiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`bao-gia-layout ${inter.className}`}>
      <AuthWrapper>
        {/* Header cho tool nội bộ */}
        <header className="bg-[#1a1d27] border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
                <Image 
                  src="/logo_sgm.png" 
                  alt="Saigon Motor Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain md:w-[40px] md:h-[40px]"
                />
              </Link>
              <div className="h-6 w-px bg-gray-700 hidden md:block"></div>
              <h1 className="text-base md:text-xl font-semibold text-[#D4AF37] truncate">
                Công Cụ Báo Giá
              </h1>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0">
                NV
              </div>
              <span className="text-xs md:text-sm text-gray-300 hidden sm:inline">Nhân viên SGM</span>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8 w-full overflow-x-hidden">
          {children}
        </main>
      </AuthWrapper>
    </div>
  );
}
