"use client";
import { useSyncExternalStore } from "react";
declare global { interface Window { dataLayer?: Record<string, unknown>[]; gtag?: (...args: unknown[]) => void } }
const subscribe=(callback:()=>void)=>{window.addEventListener("sgm-consent",callback);return()=>window.removeEventListener("sgm-consent",callback)};
export default function CookieConsent(){
  const visible=useSyncExternalStore(subscribe,()=>!localStorage.getItem("sgm_cookie_consent"),()=>false);
  const choose=(accepted:boolean)=>{localStorage.setItem("sgm_cookie_consent",accepted?"accepted":"essential");window.gtag?.("consent","update",{analytics_storage:accepted?"granted":"denied",ad_storage:accepted?"granted":"denied",ad_user_data:accepted?"granted":"denied",ad_personalization:accepted?"granted":"denied"});window.dispatchEvent(new Event("sgm-consent"))};
  if(!visible)return null;
  return <aside className="cookie-banner" aria-label="Tuỳ chọn cookie"><strong>Quyền riêng tư của bạn</strong><p>SGM sử dụng cookie đo lường để đánh giá hiệu quả của website và quảng cáo. Nếu bạn từ chối, các cookie cần thiết để website hoạt động vẫn được duy trì.</p><div className="cookie-actions"><button className="btn btn-secondary" onClick={()=>choose(true)}>Đồng ý</button><button className="btn btn-outline" onClick={()=>choose(false)}>Chỉ dùng cookie cần thiết</button></div></aside>;
}
