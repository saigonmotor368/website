import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import TrackedAnchor from "@/components/TrackedAnchor";
import { getPublicService, getServiceCategory, type PublicService } from "@/data/public-services";
import { SITE_URL, localBusinessSchema, serializeJsonLd } from "@/lib/seo";

function ListCard({ title, items }: { title: string; items: string[] }) {
  return <article className="service-detail-card"><h2>{title}</h2><ul className="check-list">{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}

export default function ServicePageTemplate({ service }: { service: PublicService }) {
  const category = getServiceCategory(service.category);
  const related = service.related.map(getPublicService).filter(Boolean) as PublicService[];
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/${service.slug}#service`,
    name: service.name,
    description: service.metaDescription,
    url: `${SITE_URL}/${service.slug}`,
    serviceType: service.name,
    provider: { "@id": localBusinessSchema["@id"] },
    areaServed: [{ "@type": "City", name: "TP. Hồ Chí Minh" }, { "@type": "Country", name: "Việt Nam" }],
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Dịch vụ", item: `${SITE_URL}/dich-vu` },
      { "@type": "ListItem", position: 3, name: category?.name || "Hồ sơ xe", item: `${SITE_URL}/dich-vu#${service.category}` },
      { "@type": "ListItem", position: 4, name: service.name, item: `${SITE_URL}/${service.slug}` },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />

    <section className="service-hero service-detail-hero">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Đường dẫn trang">
          <Link href="/">Trang chủ</Link><span>›</span><Link href="/dich-vu">Dịch vụ</Link><span>›</span><span>{service.shortName}</span>
        </nav>
        <div className="service-hero-grid">
          <div>
            <span className="eyebrow">{category?.name}</span>
            <h1>{service.h1}</h1>
            <p className="section-lead">{service.intro}</p>
            <div className="hero-actions">
              <TrackedAnchor className="btn btn-primary" href="tel:0704104104" eventName="call_click" placement="service_hero" eventData={{ service_slug: service.slug, service_group: service.category, page_path: `/${service.slug}` }}>Gọi 0704 104 104</TrackedAnchor>
              <Link className="btn btn-outline" href="#tu-van">Gửi hồ sơ để kiểm tra</Link>
            </div>
          </div>
          <aside className="service-aside">
            <span className="service-aside-label">SGM hỗ trợ từ bước đầu</span>
            <strong>Kiểm tra hồ sơ trước khi tiếp nhận</strong>
            <ul className="check-list">{service.support.map((item) => <li key={item}>{item}</li>)}</ul>
          </aside>
        </div>
      </div>
    </section>

    <section className="section"><div className="container">
      <div className="service-detail-grid">
        <ListCard title="Trường hợp SGM có thể hỗ trợ" items={service.appliesTo} />
        <ListCard title="Giấy tờ nên chuẩn bị để kiểm tra" items={service.documents} />
        <ListCard title="Trường hợp cần xem xét riêng" items={service.reviewCases} />
        <ListCard title="Phần anh/chị cần phối hợp" items={service.customerActions} />
      </div>
    </div></section>

    <section className="section section-soft"><div className="container">
      <span className="eyebrow">Quy trình tiếp nhận</span>
      <h2 className="section-heading">Mỗi bước đều được trao đổi trước khi thực hiện</h2>
      <div className="grid-4 steps service-process">
        <div className="step"><h3>Tiếp nhận thông tin</h3><p>SGM ghi nhận tình trạng xe, nhu cầu và những giấy tờ anh/chị đang có.</p></div>
        <div className="step"><h3>Kiểm tra hồ sơ</h3><p>Đối chiếu trường hợp áp dụng, nơi thực hiện và tài liệu cần bổ sung.</p></div>
        <div className="step"><h3>Hướng dẫn, báo phí</h3><p>Làm rõ quy trình, phí dịch vụ và khoản nộp cho cơ quan có thẩm quyền.</p></div>
        <div className="step"><h3>Thực hiện, theo dõi</h3><p>SGM thực hiện phần việc đã nhận và cập nhật khi cần khách hàng phối hợp.</p></div>
      </div>
    </div></section>

    <section className="section"><div className="container service-detail-split">
      <article>
        <span className="eyebrow">Thời gian và chi phí</span>
        <h2 className="section-heading">Thông tin được xác nhận theo từng hồ sơ</h2>
        <div className="service-info-block"><h3>Thời gian dự kiến</h3><p>{service.timeframe}</p></div>
        <div className="service-info-block"><h3>Chi phí dịch vụ</h3><p>{service.priceNote}</p></div>
        <div className="notice"><strong>Lưu ý:</strong> Quyết định tiếp nhận và kết quả cuối cùng thuộc cơ quan có thẩm quyền. SGM không sử dụng giấy tờ giả, không nhận hồ sơ có dấu hiệu tranh chấp và không cam kết kết quả khi chưa thẩm định.</div>
      </article>
      <aside className="service-source-card">
        <span className="eyebrow">Nguồn tham khảo chính thức</span>
        <p>Nội dung được rà soát ngày {service.reviewedAt}. Quy định và cách tiếp nhận có thể thay đổi theo thời điểm hoặc địa phương.</p>
        <ul>{service.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul>
      </aside>
    </div></section>

    <section className="section section-soft"><div className="container">
      <span className="eyebrow">Câu hỏi thường gặp</span>
      <h2 className="section-heading">Những điều anh/chị thường cần làm rõ</h2>
      <div className="faq service-faq">{service.faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
    </div></section>

    <section className="section"><div className="container">
      <div className="related-heading"><div><span className="eyebrow">Dịch vụ liên quan</span><h2 className="section-heading">Có thể anh/chị cũng đang cần</h2></div><Link href="/dich-vu" className="btn btn-outline">Xem tất cả dịch vụ</Link></div>
      <div className="grid-3 related-services">{related.map((item) => <Link key={item.slug} href={`/${item.slug}`} className="card"><span>{getServiceCategory(item.category)?.name}</span><h3>{item.name}</h3><p>{item.intro}</p><strong>Tìm hiểu dịch vụ →</strong></Link>)}</div>
    </div></section>

    <section className="section section-soft" id="tu-van"><div className="container lead-shell">
      <div className="lead-intro"><span className="eyebrow">Trao đổi trường hợp cụ thể</span><h2>Gửi thông tin để SGM kiểm tra trước</h2><p>Anh/chị mô tả giấy tờ hiện có và vấn đề đang gặp. SGM sẽ liên hệ để làm rõ hướng xử lý phù hợp.</p><ul><li>Hotline tiếp nhận cuộc gọi 24/7</li><li>Thông tin chỉ dùng cho yêu cầu tư vấn</li><li>Chi phí được báo trước khi nhận hồ sơ</li></ul></div>
      <LeadForm defaultService={service.slug} />
    </div></section>
  </main>;
}
