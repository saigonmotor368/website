"use client";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
declare global { interface Window { dataLayer?: Record<string, unknown>[]; gtag?: (...args: unknown[]) => void } }
const subscribe=(callback:()=>void)=>{window.addEventListener("sgm-consent",callback);return()=>window.removeEventListener("sgm-consent",callback)};
export default function CookieConsent(){
  const pathname = usePathname();
  const visible=useSyncExternalStore(subscribe,()=>!localStorage.getItem("sgm_cookie_consent"),()=>false);
  const choose=(accepted:boolean)=>{localStorage.setItem("sgm_cookie_consent",accepted?"accepted":"essential");window.gtag?.("consent","update",{analytics_storage:accepted?"granted":"denied",ad_storage:accepted?"granted":"denied",ad_user_data:accepted?"granted":"denied",ad_personalization:accepted?"granted":"denied"});window.dispatchEvent(new Event("sgm-consent"))};

  // Do not display cookie banner on internal management, quote tools or login pages
  if (pathname?.startsWith("/quanly") || pathname?.startsWith("/dang-nhap-noi-bo")) {
    return null;
  }

  if(!visible)return null;
  return (
    <aside className="cookie-banner" aria-label="Tuỳ chọn cookie">
      <div className="cookie-banner-content">
        <strong>Quyền riêng tư của anh/chị</strong>
        <p>SGM sử dụng cookie đo lường để đánh giá hiệu quả dịch vụ và nâng cao trải nghiệm. Nếu anh/chị từ chối, các cookie cần thiết để website hoạt động vẫn được duy trì.</p>
      </div>
      <div className="cookie-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => choose(true)}>Đồng ý</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => choose(false)}>Chỉ cookie cần thiết</button>
      </div>
    </aside>
  );
}
