"use client";

import { usePathname } from "next/navigation";
import { getPublicServiceOption } from "@/data/public-service-index";
import { trackEvent } from "@/lib/tracking";

export default function ContactWidgets() {
  const pathname = usePathname();
  const service = getPublicServiceOption(pathname.replace(/^\//, ""));
  const context = {
    page_path: pathname,
    ...(service ? { service_slug: service.slug, service_group: service.category } : {}),
  };

  return <div className="contact-rail" aria-label="Liên hệ nhanh"><a className="contact-phone" href="tel:0704104104" onClick={() => trackEvent("call_click", { ...context, placement: "sticky" })}>☎ Gọi ngay</a><a className="contact-zalo" href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("zalo_click", { ...context, placement: "sticky" })}>Zalo tư vấn</a></div>;
}
