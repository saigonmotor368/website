import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import PremiumHero from "@/components/PremiumHero";

export const metadata: Metadata = {
  title: "Dịch vụ sang tên, thu hồi hồ sơ xe",
  description: "Saigon Motor hỗ trợ sang tên, thu hồi đăng ký và biển số ô tô, xe máy tại TP.HCM và các tỉnh. Kiểm tra hồ sơ trước khi báo phí.",
  alternates: { canonical: "/" },
};

const faqs = [
  ["SGM có nhận hồ sơ xe qua nhiều đời chủ không?", "SGM sẽ kiểm tra giấy tờ và quá trình chuyển nhượng của từng trường hợp. Hồ sơ chỉ được tiếp nhận khi có cơ sở pháp lý và đáp ứng điều kiện thực hiện; SGM không khẳng định kết quả khi chưa xem hồ sơ."],
  ["Bảng giá trên website đã gồm lệ phí nhà nước chưa?", "Chưa. Bảng giá công khai là phí dịch vụ tham khảo cho hồ sơ thông thường. Thuế trước bạ, lệ phí cấp biển số và các khoản phải nộp cho cơ quan nhà nước sẽ được thông báo riêng."],
  ["Khách hàng ở tỉnh khác có thể nhờ SGM hỗ trợ không?", "Có. SGM hỗ trợ kiểm tra hồ sơ tại TP.HCM và các tỉnh. Quy trình tiếp nhận, thời gian dự kiến và chi phí sẽ phụ thuộc vào nơi đăng ký xe, loại xe và tình trạng giấy tờ thực tế."],
  ["Tôi có cần gửi ảnh giấy tờ ngay trên website không?", "Không. Biểu mẫu trên website chỉ yêu cầu thông tin cơ bản. Sau khi trao đổi, nhân viên SGM sẽ hướng dẫn bạn gửi giấy tờ qua kênh phù hợp."],
];

export default function Home() {
  return <main>
    <PremiumHero />
    <section className="trust-strip" aria-label="Điểm tin cậy"><div className="container trust-grid">
      <div className="trust-item"><strong>15 năm kinh nghiệm thực tế</strong><span>Đội ngũ am hiểu quy trình hồ sơ xe</span></div>
      <div className="trust-item"><strong>Chi phí được báo rõ</strong><span>Phân biệt phí dịch vụ và lệ phí nhà nước</span></div>
      <div className="trust-item"><strong>Kiểm tra trước khi tiếp nhận</strong><span>Chỉ nhận hồ sơ sau khi xem xét điều kiện thực hiện</span></div>
      <div className="trust-item"><strong>Hotline hỗ trợ 24/7</strong><span>0704 104 104</span></div>
    </div></section>

    <section className="section" id="dich-vu"><div className="container">
      <div className="center"><span className="eyebrow">Dịch vụ trọng tâm</span><h2 className="section-heading">Dịch vụ phù hợp với từng nhu cầu về giấy tờ xe</h2><p className="section-lead">SGM kiểm tra tình trạng giấy tờ, hướng dẫn quy trình và báo chi phí minh bạch trước khi tiếp nhận hồ sơ.</p></div>
      <div className="grid-2" style={{ marginTop: 40 }}>
        <article className="card service-card"><div className="icon-chip">01</div><h3>Sang tên ô tô, xe máy</h3><p>SGM kiểm tra giấy tờ mua bán, thông tin đăng ký và hướng dẫn các bước sang tên xe cùng tỉnh hoặc khác tỉnh.</p><ul className="service-points"><li>Kiểm tra những giấy tờ bạn đang có</li><li>Làm rõ phần việc của SGM và phần bạn cần phối hợp</li><li>Báo chi phí trước khi bắt đầu thực hiện</li></ul><div className="price">Ô tô từ 5 triệu đồng</div><small>Chi phí dịch vụ tham khảo tại TP.HCM</small><Link className="btn btn-outline" href="/thu-tuc-sang-ten-xe">Xem dịch vụ sang tên</Link></article>
        <article className="card service-card"><div className="icon-chip">02</div><h3>Thu hồi đăng ký, biển số</h3><p>SGM hỗ trợ thủ tục thu hồi khi chuyển quyền sở hữu, chuyển xe đi tỉnh khác hoặc thuộc trường hợp phải thu hồi theo quy định.</p><ul className="service-points"><li>Tiếp nhận hồ sơ ô tô và xe máy</li><li>Hỗ trợ tại TP.HCM và các tỉnh</li><li>Kiểm tra riêng những hồ sơ phức tạp</li></ul><div className="price">Xe máy từ 1,5 triệu đồng</div><small>Chi phí dịch vụ tham khảo tại TP.HCM</small><Link className="btn btn-outline" href="/thu-tuc-thu-hoi-dang-ky">Xem dịch vụ thu hồi</Link></article>
      </div>
    </div></section>

    <section className="section section-soft" id="quy-trinh"><div className="container"><span className="eyebrow">Quy trình làm việc</span><h2 className="section-heading">Hồ sơ của bạn được xử lý như thế nào?</h2><div className="grid-4 steps" style={{ marginTop: 42 }}>
      <div className="step"><h3>Tiếp nhận thông tin</h3><p>SGM ghi nhận loại xe, nơi cần làm thủ tục và những giấy tờ bạn đang có.</p></div>
      <div className="step"><h3>Kiểm tra hồ sơ</h3><p>Đội ngũ xem xét điều kiện thực hiện, giấy tờ cần bổ sung và những điểm cần lưu ý.</p></div>
      <div className="step"><h3>Hướng dẫn và báo phí</h3><p>SGM giải thích quy trình, phạm vi hỗ trợ và tách rõ từng khoản chi phí.</p></div>
      <div className="step"><h3>Thực hiện và bàn giao</h3><p>SGM thực hiện phần việc đã thống nhất, cập nhật tiến độ và bàn giao kết quả cho bạn.</p></div>
    </div></div></section>

    <section className="section" id="bang-gia"><div className="container"><span className="eyebrow">Bảng giá tham khảo</span><h2 className="section-heading">Tham khảo chi phí trước khi quyết định</h2><p className="section-lead">Các mức giá dưới đây áp dụng cho hồ sơ thông thường, giấy tờ đầy đủ. Sau khi kiểm tra tình trạng thực tế, SGM sẽ thông báo chi phí cụ thể trước khi tiếp nhận.</p><div className="price-table-wrap" style={{ marginTop: 34 }}><table className="price-table"><thead><tr><th>Dịch vụ</th><th>TP.HCM</th><th>Tỉnh khác</th></tr></thead><tbody><tr><td>Sang tên trọn gói ô tô</td><td>Từ 5.000.000 ₫</td><td>Từ 5.500.000 ₫</td></tr><tr><td>Thu hồi hồ sơ ô tô</td><td>Từ 2.500.000 ₫</td><td>Từ 2.800.000 ₫</td></tr><tr><td>Thu hồi hồ sơ xe máy</td><td>Từ 1.500.000 ₫</td><td>Từ 1.800.000–2.000.000 ₫</td></tr><tr><td>Đăng ký ô tô</td><td>Từ 2.500.000 ₫</td><td>Từ 3.000.000 ₫</td></tr><tr><td>Đăng ký xe máy</td><td>Từ 1.200.000 ₫</td><td>Từ 2.000.000 ₫</td></tr></tbody></table></div><p className="price-note">Giá có thể thay đổi khoảng 10–20% tuỳ loại xe, địa phương và tình trạng hồ sơ. Mức trên chưa gồm thuế trước bạ, lệ phí cấp biển số và các khoản phải nộp cho cơ quan nhà nước.</p></div></section>

    <section className="section section-soft"><div className="container grid-2"><div><span className="eyebrow">Hồ sơ phức tạp</span><h2 className="section-heading">Hồ sơ càng phức tạp, càng cần kiểm tra kỹ từ đầu</h2><p className="section-lead">Xe đã chuyển qua nhiều người, thiếu giấy tờ hoặc có thông tin chưa thống nhất cần được xem xét cẩn trọng. Trước khi tiếp nhận, SGM sẽ trao đổi rõ khả năng thực hiện, giấy tờ cần bổ sung và những rủi ro bạn cần biết.</p></div><div className="notice"><strong>Nguyên tắc tiếp nhận hồ sơ</strong><p style={{ marginTop: 8 }}>SGM từ chối hồ sơ có dấu hiệu giả mạo, tranh chấp, nguồn gốc không rõ ràng hoặc không đáp ứng yêu cầu của cơ quan có thẩm quyền.</p></div></div></section>

    <section className="section" id="tu-van"><div className="container"><div className="lead-shell"><div className="lead-intro"><span className="eyebrow" style={{ color: "var(--gold)" }}>Để SGM liên hệ tư vấn</span><h2>Hãy cho SGM biết tình trạng hồ sơ của bạn</h2><p>Bạn không cần tải ảnh giấy tờ lên website. Nhân viên SGM sẽ gọi lại để tìm hiểu tình trạng thực tế và hướng dẫn bước tiếp theo.</p><ul><li>✓ Thông tin được bảo mật</li><li>✓ Không tự động đăng ký nhận quảng cáo</li><li>✓ Bạn có thể yêu cầu xoá thông tin</li></ul></div><LeadForm /></div></div></section>

    <section className="section section-soft"><div className="container"><div className="center"><span className="eyebrow">Câu hỏi thường gặp</span><h2 className="section-heading">Những thông tin bạn cần biết trước khi giao hồ sơ</h2></div><div className="faq" style={{ maxWidth: 850, margin: "38px auto 0" }}>{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
  </main>;
}
