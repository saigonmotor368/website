"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPublicServiceOption, publicServiceOptions } from "@/data/public-service-index";
import { trackEvent } from "@/lib/tracking";

const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d979.6440091344593!2d106.74482236957297!3d10.843721216490096!2m3!1f0!2f0!3f0!3m2!1i1024!1i768!4f13.1!3m3!1m2!1s0x317529694d857ee5%3A0x295149ad047b9d78!2sC%C3%B4ng%20Ty%20TNHH%20OTO%20XE%20M%C3%81Y%20368!5e0!3m2!1svi!2s!4v1785209952676!5m2!1svi!2s";

export default function Footer() {
  const pathname = usePathname();
  const service = getPublicServiceOption(pathname.replace(/^\//, ""));
  const trackingContext = { page_path: pathname, ...(service ? { service_slug: service.slug, service_group: service.category } : {}) };
  return <footer className="site-footer" id="lien-he"><div className="container">
    <div className="footer-grid">
      <div>
        <span className="eyebrow" style={{ color: "var(--gold)" }}>Saigon Motor</span>
        <h2 style={{ marginTop: 10 }}>Cần hỗ trợ thủ tục giấy tờ xe? Hãy trao đổi trực tiếp với SGM.</h2>
        <ul className="footer-info">
          <li><strong>Pháp nhân:</strong> Công ty TNHH Ô tô Xe máy 368</li>
          <li><strong>Mã số doanh nghiệp:</strong> 0316339254</li>
          <li><strong>Người đại diện:</strong> Lương Thế Bằng</li>
          <li><strong>Địa chỉ:</strong> 745 Phạm Văn Đồng, Khu phố 8, phường Hiệp Bình, TP. Hồ Chí Minh</li>
          <li><strong>Email:</strong> <a href="mailto:saigonmotor68@gmail.com">saigonmotor68@gmail.com</a></li>
          <li><strong>Hotline/Zalo:</strong> <a href="tel:0704104104" onClick={() => trackEvent("call_click", { ...trackingContext, placement: "footer" })}>0704 104 104</a></li>
        </ul>
        <div className="social-links">
          <a href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("zalo_click", { ...trackingContext, placement: "footer" })}>Zalo</a>
          <a href="https://m.me/396499820207432" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("messenger_click", { ...trackingContext, placement: "footer" })}>Messenger</a>
          <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
        </div>
      </div>
      <div>
        <iframe className="map-frame" src={mapUrl} title="Bản đồ Saigon Motor" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
        <a href="https://maps.google.com/?q=10.8437212,106.7448224" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginTop: 14, color: "white", borderColor: "rgba(255,255,255,.5)" }} onClick={() => trackEvent("directions_click")}>Xem đường đi</a>
      </div>
    </div>
    <div className="footer-services">
      <div><strong>Dịch vụ thường được quan tâm</strong><Link href="/dich-vu">Xem tất cả dịch vụ →</Link></div>
      <nav aria-label="Dịch vụ nổi bật">
        {publicServiceOptions.filter((service) => service.featured).slice(0, 8).map((service) => (
          <Link href={`/${service.slug}`} key={service.slug}>{service.shortName}</Link>
        ))}
      </nav>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Saigon Motor. Thông tin trên website mang tính tham khảo và không thay thế hướng dẫn của cơ quan có thẩm quyền.</span><span><Link href="/phap-ly-cam-ket">Nguyên tắc phục vụ</Link> · <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link></span></div>
  </div></footer>;
}
