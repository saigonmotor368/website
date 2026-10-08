import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saigon Motor - Dịch vụ hồ sơ xe",
    short_name: "Saigon Motor",
    description:
      "Hỗ trợ sang tên xe, thu hồi đăng ký và biển số ô tô, xe máy tại TP.HCM và các tỉnh.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8f7",
    theme_color: "#0b3132",
    lang: "vi-VN",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
