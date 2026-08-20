import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/bao-gia/", "/api/"],
    },
    sitemap: "https://saigonmotor.vn/sitemap.xml",
  };
}
