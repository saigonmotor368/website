import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageTemplate from "@/components/ServicePageTemplate";
import { dynamicPublicServices, getPublicService } from "@/data/public-services";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return dynamicPublicServices.map((service) => ({ serviceSlug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ serviceSlug: string }> }): Promise<Metadata> {
  const { serviceSlug } = await params;
  const service = getPublicService(serviceSlug);
  if (!service || service.existingRoute) return {};
  const url = `${SITE_URL}/${service.slug}`;
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/${service.slug}` },
    openGraph: { title: `${service.metaTitle} | Saigon Motor`, description: service.metaDescription, url, type: "website", locale: "vi_VN", images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${service.name} - Saigon Motor` }] },
    twitter: { card: "summary_large_image", title: `${service.metaTitle} | Saigon Motor`, description: service.metaDescription, images: [OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}

export default async function DynamicServicePage({ params }: { params: Promise<{ serviceSlug: string }> }) {
  const { serviceSlug } = await params;
  const service = getPublicService(serviceSlug);
  if (!service || service.existingRoute) notFound();
  return <ServicePageTemplate service={service} />;
}
