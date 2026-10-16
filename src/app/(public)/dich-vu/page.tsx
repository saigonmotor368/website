import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import ServiceDirectory from "@/components/ServiceDirectory";
import TrackedAnchor from "@/components/TrackedAnchor";
import { serializeJsonLd, SITE_URL } from "@/lib/seo";

const pageTitle = "Dịch vụ hồ sơ pháp lý ô tô, xe máy";
const pageDescription = "Tra cứu dịch vụ hồ sơ xe tại Saigon Motor: đăng ký, sang tên, cấp lại giấy tờ, phạt nguội, đăng kiểm, cải tạo và hồ sơ xe kinh doanh vận tải.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/dich-vu" },
  openGraph: {
    title: `${pageTitle} | Saigon Motor`,
    description: pageDescription,
    url: `${SITE_URL}/dich-vu`,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Dịch vụ", item: `${SITE_URL}/dich-vu` },
  ],
};

export default function ServicesPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <section className="service-hub-hero">
        <div className="container service-hub-hero-inner">
          <nav className="breadcrumbs" aria-label="Đường dẫn trang">
            <Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span>Dịch vụ</span>
          </nav>
          <span className="eyebrow">Dịch vụ hồ sơ xe</span>
          <h1>Chọn đúng dịch vụ cho hồ sơ của quý khách</h1>
          <p>Saigon Motor hỗ trợ hồ sơ pháp lý cho ô tô, xe máy và xe kinh doanh vận tải. Mỗi dịch vụ đều nêu rõ trường hợp áp dụng, giấy tờ cần chuẩn bị, các bước thực hiện và những khoản phí quý khách cần lưu ý.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="#danh-sach-dich-vu">Xem danh sách dịch vụ</Link>
            <TrackedAnchor className="btn btn-outline" href="tel:0704104104" eventName="call_click" placement="services_hub_hero" eventData={{ page_path: "/dich-vu" }}>Gọi 0704 104 104</TrackedAnchor>
          </div>
        </div>
      </section>

      <section className="section" id="danh-sach-dich-vu">
        <div className="container">
          <div className="service-directory-intro">
            <div>
              <span className="eyebrow">Tra cứu theo nhu cầu</span>
              <h2 className="section-heading">Tất cả dịch vụ của Saigon Motor</h2>
            </div>
            <p>Quý khách có thể chọn loại xe hoặc nhóm khách hàng để thu gọn danh sách. Với hồ sơ còn thiếu giấy tờ, SGM sẽ kiểm tra riêng trước khi tiếp nhận.</p>
          </div>
          <ServiceDirectory />
        </div>
      </section>

      <section className="section section-soft" id="tu-van-dich-vu">
        <div className="container">
          <div className="lead-shell">
            <div className="lead-intro">
              <span className="eyebrow" style={{ color: "var(--gold)" }}>Chưa biết chọn dịch vụ nào?</span>
              <h2>Chia sẻ tình trạng hồ sơ để SGM tư vấn đúng thủ tục</h2>
              <p>Quý khách vui lòng cho biết loại xe, nơi đang đăng ký và những giấy tờ hiện có. Nhân viên SGM sẽ liên hệ để hướng dẫn bước tiếp theo.</p>
            </div>
            <LeadForm />
          </div>
        </div>
      </section>
    </main>
  );
}
