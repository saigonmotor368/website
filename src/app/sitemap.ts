import type { MetadataRoute } from "next";

const base = "https://saigonmotor.vn";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/thu-tuc-sang-ten-xe`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/thu-tuc-thu-hoi-dang-ky`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/thu-tuc-cap-doi-giay-to`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/doi-bien-so-vang`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/quy-dinh-uy-quyen-xe`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/kiem-tra-phat-nguoi`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/phap-ly-cam-ket`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/chinh-sach-bao-mat`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
