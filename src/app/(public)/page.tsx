import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import PremiumHero from "@/components/PremiumHero";
import { serviceCategories } from "@/data/public-services";
import { OG_IMAGE, serializeJsonLd, SITE_URL } from "@/lib/seo";

const pageTitle = "Dịch vụ hồ sơ pháp lý ô tô, xe máy tại TP.HCM";
const pageDescription =
  "Saigon Motor hỗ trợ đăng ký, sang tên, cấp lại giấy tờ, phạt nguội, đăng kiểm và hồ sơ xe kinh doanh vận tải tại TP.HCM và các tỉnh.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${pageTitle} | Saigon Motor`,
    description: pageDescription,
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Saigon Motor - Dịch vụ hồ sơ xe" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | Saigon Motor`,
    description: pageDescription,
    images: [OG_IMAGE],
  },
};

const faqs = [
  ["SGM có tiếp nhận hồ sơ xe đã qua nhiều đời chủ không?", "Với những trường hợp này, chúng tôi cần xem kỹ giấy tờ và quá trình chuyển nhượng qua từng đời chủ. SGM chỉ tiếp nhận khi hồ sơ có đủ căn cứ pháp lý và đáp ứng điều kiện thực hiện thủ tục. Khi chưa xem hồ sơ, chúng tôi không nhận định trước về kết quả."],
  ["Bảng giá trên website đã gồm lệ phí nhà nước chưa?", "Chưa. Bảng giá trên website là phí dịch vụ tham khảo dành cho hồ sơ thông thường. Thuế trước bạ, lệ phí cấp biển số và các khoản phải nộp cho cơ quan nhà nước sẽ được SGM thông báo riêng để quý khách nắm rõ."],
  ["Quý khách ở tỉnh khác có thể nhờ SGM hỗ trợ không?", "Có. SGM hỗ trợ kiểm tra hồ sơ cho quý khách tại TP.HCM và các tỉnh. Cách thức tiếp nhận, thời gian dự kiến và chi phí sẽ tùy thuộc vào nơi đăng ký xe, loại xe và tình trạng giấy tờ thực tế."],
  ["Tôi có cần gửi ảnh giấy tờ ngay trên website không?", "Không cần. Biểu mẫu trên website chỉ gồm một vài thông tin cơ bản. Sau khi trao đổi, nhân viên SGM sẽ hướng dẫn quý khách gửi giấy tờ qua kênh thuận tiện nhất."],
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function Home() {
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
    <PremiumHero />
    <section className="trust-strip" aria-label="Điểm tin cậy"><div className="container trust-grid">
      <div className="trust-item"><strong>15 năm kinh nghiệm thực tế</strong><span>Am tường từng bước của hồ sơ xe</span></div>
      <div className="trust-item"><strong>Chi phí rõ ràng từ đầu</strong><span>Tách bạch phí dịch vụ và lệ phí nhà nước</span></div>
      <div className="trust-item"><strong>Kiểm tra trước khi tiếp nhận</strong><span>Xem xét kỹ điều kiện rồi mới tiếp nhận hồ sơ</span></div>
      <div className="trust-item"><strong>Hotline hỗ trợ 24/7</strong><span>0704 104 104</span></div>
    </div></section>

    <section className="section" id="dich-vu"><div className="container">
      <div className="center"><span className="eyebrow">Dịch vụ hồ sơ xe</span><h2 className="section-heading">Thủ tục nào quý khách cần, chúng tôi đều sẵn lòng hướng dẫn</h2><p className="section-lead">Saigon Motor hỗ trợ hồ sơ pháp lý cho ô tô, xe máy và xe kinh doanh vận tải. Với mỗi trường hợp, chúng tôi đều kiểm tra trước, hướng dẫn rõ từng bước và báo chi phí trước khi tiếp nhận.</p></div>
      <div className="home-service-groups" style={{ marginTop: 40 }}>
        {serviceCategories.map((category) => (
          <Link className="home-service-group" href={`/dich-vu#${category.id}`} key={category.id}>
            <span className="icon-chip" aria-hidden="true">{category.icon}</span>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span className="service-card-link">Xem các dịch vụ <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
      <div className="center" style={{ marginTop: 30 }}><Link className="btn btn-primary" href="/dich-vu">Xem tất cả dịch vụ</Link></div>
    </div></section>

    <section className="section section-soft" id="quy-trinh"><div className="container"><span className="eyebrow">Quy trình làm việc</span><h2 className="section-heading">Bốn bước rõ ràng, từ lúc quý khách liên hệ đến khi nhận kết quả</h2><div className="grid-4 steps" style={{ marginTop: 42 }}>
      <div className="step"><h3>Tiếp nhận thông tin</h3><p>SGM ghi nhận loại xe, nơi cần thực hiện thủ tục và những giấy tờ quý khách đang có.</p></div>
      <div className="step"><h3>Kiểm tra hồ sơ</h3><p>Chúng tôi xem xét hồ sơ đã đủ điều kiện hay chưa, cần bổ sung giấy tờ gì và có điểm nào cần lưu ý.</p></div>
      <div className="step"><h3>Báo phí rõ ràng</h3><p>Quý khách được giải thích từng bước, biết rõ phần việc SGM đảm nhận và từng khoản chi phí trước khi quyết định.</p></div>
      <div className="step"><h3>Thực hiện và bàn giao kết quả</h3><p>SGM thực hiện đúng phần việc đã thống nhất, thường xuyên cập nhật tiến độ và bàn giao kết quả khi hoàn tất.</p></div>
    </div></div></section>

    <section className="section" id="bang-gia"><div className="container"><span className="eyebrow">Bảng giá tham khảo</span><h2 className="section-heading">Biết trước chi phí để quý khách an tâm quyết định</h2><p className="section-lead">Mức giá dưới đây áp dụng cho hồ sơ thông thường, giấy tờ đầy đủ. Sau khi xem xét tình trạng thực tế, SGM sẽ báo chi phí cụ thể trước khi tiếp nhận hồ sơ.</p><div className="price-table-wrap" style={{ marginTop: 34 }}><table className="price-table"><thead><tr><th>Dịch vụ</th><th>TP.HCM</th><th>Tỉnh khác</th></tr></thead><tbody><tr><td>Sang tên trọn gói ô tô</td><td>Từ 5.000.000 ₫</td><td>Từ 5.500.000 ₫</td></tr><tr><td>Thu hồi hồ sơ ô tô</td><td>Từ 2.500.000 ₫</td><td>Từ 2.800.000 ₫</td></tr><tr><td>Thu hồi hồ sơ xe máy</td><td>Từ 1.500.000 ₫</td><td>Từ 1.800.000–2.000.000 ₫</td></tr><tr><td>Đăng ký ô tô</td><td>Từ 2.500.000 ₫</td><td>Từ 3.000.000 ₫</td></tr><tr><td>Đăng ký xe máy</td><td>Từ 1.200.000 ₫</td><td>Từ 2.000.000 ₫</td></tr></tbody></table></div><p className="price-note">Giá có thể dao động khoảng 10–20% tùy loại xe, địa phương và tình trạng hồ sơ. Mức trên chưa gồm thuế trước bạ, lệ phí cấp biển số và các khoản phải nộp cho cơ quan nhà nước.</p></div></section>

    <section className="section section-soft"><div className="container grid-2"><div><span className="eyebrow">Hồ sơ phức tạp</span><h2 className="section-heading">Hồ sơ càng phức tạp, càng cần kiểm tra kỹ từ đầu</h2><p className="section-lead">Xe đã qua nhiều đời chủ, thiếu giấy tờ hoặc có thông tin chưa thống nhất càng cần được xem xét cẩn trọng ngay từ đầu. Trước khi tiếp nhận, SGM sẽ trao đổi rõ với quý khách hồ sơ có thể thực hiện được hay không, cần bổ sung những gì và có điều gì cần lưu ý.</p></div><div className="notice"><strong>Nguyên tắc tiếp nhận hồ sơ</strong><p style={{ marginTop: 8 }}>SGM từ chối tiếp nhận hồ sơ có dấu hiệu giả mạo, đang tranh chấp, không rõ nguồn gốc hoặc không đáp ứng yêu cầu của cơ quan có thẩm quyền.</p></div></div></section>

    <section className="section" id="tu-van"><div className="container"><div className="lead-shell"><div className="lead-intro"><span className="eyebrow" style={{ color: "var(--gold)" }}>Để SGM liên hệ tư vấn</span><h2>Quý khách chia sẻ tình trạng hồ sơ, SGM sẽ cùng tìm hướng xử lý</h2><p>Quý khách không cần tải ảnh giấy tờ lên website. Nhân viên SGM sẽ gọi lại, tìm hiểu tình trạng thực tế và hướng dẫn quý khách bước tiếp theo.</p><ul><li>✓ Chúng tôi bảo mật thông tin quý khách cung cấp</li><li>✓ Không tự động đưa quý khách vào danh sách nhận quảng cáo</li><li>✓ Quý khách có thể yêu cầu xoá thông tin</li></ul></div><LeadForm /></div></div></section>

    <section className="section section-soft"><div className="container"><div className="center"><span className="eyebrow">Câu hỏi thường gặp</span><h2 className="section-heading">Những điều quý khách thường quan tâm trước khi giao hồ sơ</h2></div><div className="faq" style={{ maxWidth: 850, margin: "38px auto 0" }}>{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
  </main>;
}
