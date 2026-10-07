"use client";
import { trackEvent } from "@/lib/tracking";
export default function ContactWidgets(){return <div className="contact-rail" aria-label="Liên hệ nhanh"><a className="contact-phone" href="tel:0704104104" onClick={()=>trackEvent("call_click",{placement:"sticky"})}>☎ Gọi ngay</a><a className="contact-zalo" href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("zalo_click",{placement:"sticky"})}>Zalo tư vấn</a></div>}
