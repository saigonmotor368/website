import type { Metadata } from "next";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { getPublicService } from "@/data/public-services";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";

const service = getPublicService("thu-tuc-thu-hoi-dang-ky")!;

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: { canonical: `/${service.slug}` },
  openGraph: { title: `${service.metaTitle} | Saigon Motor`, description: service.metaDescription, url: `${SITE_URL}/${service.slug}`, images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: service.name }] },
  twitter: { card: "summary_large_image", title: service.metaTitle, description: service.metaDescription, images: [OG_IMAGE] },
};

export default function Page() {
  return <ServicePageTemplate service={service} />;
}
