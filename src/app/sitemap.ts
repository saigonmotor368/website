import type { MetadataRoute } from "next";
import { publicServices } from "@/data/public-services";

const base = "https://saigonmotor.vn";
const lastContentUpdate = new Date("2026-10-10T00:00:00+07:00");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: lastContentUpdate, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/dich-vu`, lastModified: lastContentUpdate, changeFrequency: "weekly", priority: 0.95 },
    ...publicServices.map((service) => ({
      url: `${base}/${service.slug}`,
      lastModified: lastContentUpdate,
      changeFrequency: "monthly" as const,
      priority: service.featured ? 0.9 : 0.8,
    })),
    { url: `${base}/phap-ly-cam-ket`, lastModified: lastContentUpdate, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/chinh-sach-bao-mat`, lastModified: lastContentUpdate, changeFrequency: "yearly", priority: 0.4 },
  ];
}
