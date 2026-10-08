import type { MetadataRoute } from "next";

const base = "https://saigonmotor.vn";
const lastContentUpdate = new Date("2026-10-08T00:00:00+07:00");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: lastContentUpdate, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/thu-tuc-sang-ten-xe`, lastModified: lastContentUpdate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/thu-tuc-thu-hoi-dang-ky`, lastModified: lastContentUpdate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/phap-ly-cam-ket`, lastModified: lastContentUpdate, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/chinh-sach-bao-mat`, lastModified: lastContentUpdate, changeFrequency: "yearly", priority: 0.4 },
  ];
}
