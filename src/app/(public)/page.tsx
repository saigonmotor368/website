import { Metadata } from "next";
import HomePageClient from "./components/HomePageClient";

export const metadata: Metadata = {
  title: "Saigon Motor | Dịch Vụ Hồ Sơ, Sang Tên, Rút Gốc Ô Tô Xe Máy",
  description: "Dịch vụ pháp lý xe chuyên nghiệp tại TP.HCM. Hỗ trợ sang tên, rút hồ sơ gốc, cấp đổi cavet, biển số định danh nhanh chóng, bảo mật, minh bạch chi phí.",
  openGraph: {
    title: "Saigon Motor | Dịch Vụ Hồ Sơ Pháp Lý Xe Uy Tín",
    description: "Giải pháp trọn gói sang tên, rút gốc, cấp đổi giấy tờ xe ô tô và xe máy. Xử lý hồ sơ vắng chủ, rút hồ sơ chuyển tỉnh.",
    url: "https://saigonmotor.vn",
    siteName: "Saigon Motor",
    locale: "vi_VN",
    type: "website",
  },
};

export default function Home() {
  return <HomePageClient />;
}
