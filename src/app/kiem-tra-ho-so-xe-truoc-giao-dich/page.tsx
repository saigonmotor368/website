import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import TrackedAnchor from "@/components/TrackedAnchor";
import { OG_IMAGE, serializeJsonLd, SITE_URL } from "@/lib/seo";
import PrePurchaseReviewForm from "./PrePurchaseReviewForm";
import styles from "../tu-van-ho-so-xe/page.module.css";

const PAGE_PATH = "/kiem-tra-ho-so-xe-truoc-giao-dich";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const GOOGLE_ADS_ID = "AW-18352281213";
const title = "Kiểm tra hồ sơ xe trước giao dịch tại TP.HCM";
const description = "SGM rà soát giấy tờ xe trước khi anh/chị mua hoặc nhận chuyển nhượng. Phí 500.000 đồng một hồ sơ, có bản tổng hợp nội dung cần xác minh và giấy tờ cần bổ sung.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: PAGE_PATH },
  robots: { index: false, follow: true },
  openGraph: {
    title: `${title} | Saigon Motor`,
    description,
    type: "website",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Saigon Motor kiểm tra hồ sơ xe trước giao dịch" }],
  },
};

const trackingData = { service_slug: "kiem-tra-ho-so-xe-truoc-giao-dich", service_group: "consultation", page_path: PAGE_PATH };

const faqs = [
  {
    question: "Phí 500.000 đồng bao gồm những gì?",
    answer: "Phí áp dụng cho việc rà soát một bộ hồ sơ xe trước giao dịch và bản tổng hợp kết quả. SGM nêu rõ giấy tờ đã nhận, điểm chưa thống nhất, nội dung cần xác minh, giấy tờ nên yêu cầu bên bán bổ sung và những lưu ý trước khi ký kết.",
  },
  {
    question: "SGM có bảo đảm xe đủ điều kiện sang tên không?",
    answer: "Không. Kết quả kiểm tra được lập từ giấy tờ và thông tin anh/chị cung cấp, giúp nhận diện vấn đề trước giao dịch. Việc tiếp nhận và quyết định một thủ tục hành chính thuộc cơ quan có thẩm quyền.",
  },
  {
    question: "Tôi có bắt buộc phải dùng thêm dịch vụ của SGM không?",
    answer: "Không. Gói kiểm tra hồ sơ là một dịch vụ độc lập. Sau khi nhận bản tổng hợp, anh/chị có thể tự làm việc với bên bán hoặc tự thực hiện bước tiếp theo. Nếu anh/chị chủ động yêu cầu SGM hỗ trợ thêm, phần việc đó được báo riêng.",
  },
  {
    question: "SGM có kiểm tra được xe đang thế chấp hoặc có vi phạm không?",
    answer: "SGM sẽ hướng dẫn đối chiếu các nguồn có thể tra cứu và chỉ ghi nhận những thông tin có căn cứ tại thời điểm kiểm tra. Một số dữ liệu không công khai hoặc cần cơ quan có thẩm quyền xác nhận sẽ được nêu rõ là nội dung cần xác minh thêm.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Kiểm tra hồ sơ xe trước giao dịch",
    description,
    url: PAGE_URL,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: { "@type": "City", name: "TP. Hồ Chí Minh" },
    offers: { "@type": "Offer", price: "500000", priceCurrency: "VND" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  },
];

export default function PrePurchaseReviewPage() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <div className={styles.page}>
      <Script id="pre-purchase-google-ads-library" src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="pre-purchase-google-ads-config" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`}</Script>
      {gtmId ? <Script id="pre-purchase-gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script> : null}
      {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />)}

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href={PAGE_PATH} aria-label="Saigon Motor - Kiểm tra hồ sơ xe trước giao dịch">
            <Image src="/logo_sgm.png" width={54} height={54} alt="Saigon Motor" priority />
            <span><strong>SAIGON <em>MOTOR</em></strong><small>Công ty TNHH Ô tô Xe máy 368</small></span>
          </Link>
          <nav aria-label="Nội dung trang kiểm tra hồ sơ xe"><a href="#ket-qua">Kết quả nhận được</a><a href="#quy-trinh">Quy trình kiểm tra</a><a href="#cau-hoi">Câu hỏi thường gặp</a></nav>
          <TrackedAnchor className={styles.headerCall} href="tel:0704104104" eventName="call_click" placement="pre_purchase_header" eventData={trackingData}>Gọi 0704 104 104</TrackedAnchor>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Kiểm tra trước khi đặt cọc hoặc ký mua bán</span>
              <h1>Đừng để giấy tờ chưa rõ ràng trở thành rủi ro sau khi mua xe</h1>
              <p className={styles.heroLead}>Saigon Motor rà soát giấy tờ bên bán cung cấp, chỉ ra nội dung chưa thống nhất và lập danh sách những việc anh/chị nên xác minh trước khi giao dịch. Đây là gói kiểm tra độc lập; anh/chị vẫn nhận được bản tổng hợp đầy đủ dù không sử dụng thêm dịch vụ nào khác.</p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#dang-ky">Đăng ký kiểm tra — 500.000 đồng</a>
                <TrackedAnchor className={styles.secondaryButton} href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" eventName="zalo_click" placement="pre_purchase_hero" eventData={trackingData}>Trao đổi qua Zalo</TrackedAnchor>
              </div>
              <div className={styles.privateNotice}><strong>Phạm vi rõ ràng</strong><p>SGM đánh giá trên hồ sơ và thông tin anh/chị cung cấp; không thay thế hoạt động giám định phương tiện, xác nhận của cơ quan nhà nước hoặc tư vấn pháp lý chuyên biệt.</p></div>
            </div>
            <div className={styles.reviewCard} aria-label="Nội dung bàn giao sau khi kiểm tra hồ sơ">
              <div className={styles.reviewTop}><span>Kết quả bàn giao</span><strong>Một hồ sơ — 500.000 đồng</strong></div>
              <ol>
                <li><span>01</span><div><strong>Tóm tắt giấy tờ đã cung cấp</strong><p>Ghi nhận từng tài liệu và thông tin chính đang có.</p></div></li>
                <li><span>02</span><div><strong>Điểm chưa thống nhất</strong><p>Nêu rõ thông tin thiếu, khác nhau hoặc chưa đủ căn cứ.</p></div></li>
                <li><span>03</span><div><strong>Danh sách cần bổ sung</strong><p>Những giấy tờ hoặc xác nhận nên yêu cầu bên bán cung cấp.</p></div></li>
                <li><span>04</span><div><strong>Lưu ý trước giao dịch</strong><p>Rủi ro cần cân nhắc và nguồn chính thức để kiểm tra tiếp.</p></div></li>
              </ol>
              <div className={styles.reviewFoot}>Gói kiểm tra độc lập, không bắt buộc mua thêm dịch vụ</div>
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Thông tin gói kiểm tra"><div><span>Chi phí trọn gói <strong>500.000 đồng</strong></span><span>Áp dụng cho <strong>một bộ hồ sơ xe</strong></span><span>Có <strong>bản tổng hợp kết quả</strong> sau kiểm tra</span></div></section>

        <section className={styles.section} id="ket-qua">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}><span className={styles.eyebrow}>Khi nào nên kiểm tra?</span><h2>Rà soát trước khi xuống tiền giúp anh/chị biết mình đang thiếu thông tin gì</h2><p>Dịch vụ phù hợp khi mua xe cũ từ cá nhân, nhận thanh lý xe doanh nghiệp hoặc tiếp nhận một phương tiện đã qua nhiều lần giao dịch.</p></div>
            <div className={styles.caseGrid}>
              <article><span>01</span><h3>Người bán không đứng tên trên đăng ký</h3><p>Kiểm tra chuỗi giấy tờ và xác định những thông tin cần làm rõ với người đang đứng tên hoặc bên chuyển nhượng.</p></article>
              <article><span>02</span><h3>Xe thuộc sở hữu doanh nghiệp</h3><p>Rà soát thông tin pháp nhân, người ký, hóa đơn, quyết định thanh lý và giấy tờ liên quan đến việc bán xe.</p></article>
              <article><span>03</span><h3>Thông tin trên giấy tờ không đồng nhất</h3><p>Đối chiếu tên, địa chỉ, đặc điểm phương tiện và những dữ liệu có thể kiểm tra từ nguồn chính thức.</p></article>
              <article><span>04</span><h3>Chưa biết cần yêu cầu bên bán cung cấp gì</h3><p>Lập danh sách giấy tờ nên bổ sung và câu hỏi cần được giải đáp trước khi đặt cọc hoặc thanh toán.</p></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="quy-trinh">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}><span className={styles.eyebrow}>Quy trình kiểm tra</span><h2>Từng bước đều có đầu ra rõ ràng</h2></div>
            <div className={styles.processGrid}>
              <div><span>1</span><h3>Ghi nhận nhu cầu</h3><p>Xác định loại xe, bên bán, hình thức giao dịch và thời điểm dự kiến ký kết.</p></div>
              <div><span>2</span><h3>Tiếp nhận bản chụp</h3><p>SGM hướng dẫn gửi tài liệu qua kênh đã thống nhất; website không yêu cầu tải giấy tờ.</p></div>
              <div><span>3</span><h3>Đối chiếu thông tin</h3><p>Rà soát sự thống nhất giữa các giấy tờ và ghi nhận nội dung chưa có căn cứ xác nhận.</p></div>
              <div><span>4</span><h3>Lập bản tổng hợp</h3><p>Liệt kê giấy tờ đã nhận, vấn đề cần xác minh, nội dung cần bổ sung và lưu ý trước giao dịch.</p></div>
              <div><span>5</span><h3>Trao đổi kết quả</h3><p>Giải thích những điểm quan trọng để anh/chị tự quyết định bước tiếp theo.</p></div>
            </div>
            <p className={styles.legalNote}>Phí 500.000 đồng chỉ áp dụng cho gói kiểm tra một bộ hồ sơ. Việc xác minh chuyên sâu, giám định phương tiện hoặc hỗ trợ một thủ tục khác không nằm trong gói này và chỉ được thực hiện sau khi có báo giá riêng.</p>
          </div>
        </section>

        <section className={styles.section} id="dang-ky">
          <div className={`${styles.sectionInner} ${styles.formLayout}`}>
            <div className={styles.formSide}><span className={styles.eyebrow}>Kiểm tra trước khi giao dịch</span><h2>Gửi thông tin ban đầu để SGM xác nhận phạm vi</h2><p>Anh/chị chưa cần gửi ảnh giấy tờ trên website. Sau khi nhận yêu cầu, SGM sẽ liên hệ, giải thích cách thực hiện và chỉ bắt đầu khi anh/chị đồng ý.</p><div className={styles.contactCard}><span>Hotline/Zalo</span><strong>0704 104 104</strong><small>Hotline nhận cuộc gọi 24/7. Yêu cầu qua form được xử lý trong khung giờ làm việc.</small></div></div>
            <PrePurchaseReviewForm />
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="cau-hoi"><div className={styles.narrowInner}><div className={styles.sectionIntro}><span className={styles.eyebrow}>Câu hỏi thường gặp</span><h2>Hiểu rõ dịch vụ trước khi đăng ký</h2></div><div className={styles.faqList}>{faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>
      </main>

      <footer className={styles.footer}><div className={styles.footerInner}><div><strong>Saigon Motor</strong><p>Nhánh dịch vụ của Công ty TNHH Ô tô Xe máy 368</p></div><div><span>MST 0316339254</span><span>745 Phạm Văn Đồng, Khu phố 8, phường Hiệp Bình, TP. Hồ Chí Minh</span></div><div><Link href="/phap-ly-cam-ket">Thông tin pháp lý</Link><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link></div></div></footer>
      <div className={styles.mobileRail} aria-label="Liên hệ nhanh"><TrackedAnchor href="tel:0704104104" eventName="call_click" placement="pre_purchase_sticky" eventData={trackingData}>Gọi SGM</TrackedAnchor><TrackedAnchor href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" eventName="zalo_click" placement="pre_purchase_sticky" eventData={trackingData}>Nhắn Zalo</TrackedAnchor></div>
    </div>
  );
}
