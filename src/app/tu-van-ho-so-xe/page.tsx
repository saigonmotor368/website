import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import TrackedAnchor from "@/components/TrackedAnchor";
import { OG_IMAGE, serializeJsonLd, SITE_URL } from "@/lib/seo";
import ConsultationLeadForm from "./ConsultationLeadForm";
import styles from "./page.module.css";

const PAGE_PATH = "/tu-van-ho-so-xe";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const GOOGLE_ADS_ID = "AW-18352281213";
const LEGAL_NAME = "Công ty TNHH Ô tô Xe máy 368";
const title = "Hỗ trợ hồ sơ, thủ tục xe tại TP.HCM rõ ràng";
const description =
  "Saigon Motor kiểm tra hồ sơ xe và báo phí rõ ràng trước khi thực hiện. Chúng tôi là đơn vị dịch vụ tư nhân, không phải cơ quan nhà nước.";

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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Saigon Motor hỗ trợ hồ sơ và thủ tục xe" }],
  },
};

const trackingData = {
  service_slug: "tu-van-ho-so-xe",
  service_group: "consultation",
  page_path: PAGE_PATH,
};

const faqs = [
  {
    question: "Saigon Motor có phải là cơ quan đăng ký xe không?",
    answer:
      `Không. Chúng tôi là đơn vị dịch vụ tư nhân thuộc ${LEGAL_NAME}. SGM hỗ trợ quý khách chuẩn bị hồ sơ và thực hiện thủ tục trong phạm vi pháp luật cho phép. Việc tiếp nhận, phê duyệt hồ sơ và cấp giấy đăng ký, biển số hay các giấy tờ khác thuộc thẩm quyền của cơ quan nhà nước.`,
  },
  {
    question: "SGM chỉ tư vấn hay có tiếp nhận thực hiện hồ sơ?",
    answer:
      "Có. Sau khi kiểm tra hồ sơ và thống nhất phương án cùng quý khách, SGM có thể chuẩn bị, hoàn thiện hồ sơ và đảm nhận những phần việc hai bên đã thỏa thuận. Ở những khâu pháp luật cho phép ủy quyền, chúng tôi có thể thay mặt quý khách làm việc theo hợp đồng dịch vụ hoặc giấy ủy quyền hợp lệ. Trường hợp quy định yêu cầu chủ xe trực tiếp ký, xuất trình bản gốc hoặc có mặt, SGM sẽ thông báo trước để quý khách thuận tiện sắp xếp.",
  },
  {
    question: "Trong trường hợp nào SGM có thể đại diện cho tôi?",
    answer:
      "SGM chỉ thay mặt quý khách khi hội đủ ba điều kiện: hai bên đã thống nhất rõ phạm vi công việc; quý khách cung cấp giấy ủy quyền hợp lệ nếu thủ tục yêu cầu; và quy định hiện hành cho phép người được ủy quyền thực hiện công việc đó.",
  },
  {
    question: "Chi phí dịch vụ gồm những khoản nào?",
    answer:
      "Chi phí gồm ba phần: phí dịch vụ của SGM; lệ phí hoặc thuế nộp theo thông báo của cơ quan có thẩm quyền; và những khoản có thể phát sinh tùy tình trạng thực tế của hồ sơ. Chúng tôi thông báo rõ từng khoản trước khi tiếp nhận hồ sơ để quý khách chủ động cân nhắc.",
  },
  {
    question: "SGM có bảo đảm hồ sơ được chấp thuận không?",
    answer:
      "SGM chịu trách nhiệm thực hiện đúng phần việc đã thống nhất, cập nhật tiến độ và thông báo cho quý khách khi hồ sơ cần bổ sung. Việc chấp thuận hồ sơ và thời gian giải quyết do cơ quan có thẩm quyền quyết định, vì vậy chúng tôi không hứa trước kết quả.",
  },
  {
    question: "Tôi có cần gửi ảnh giấy tờ qua website không?",
    answer:
      "Không cần. Tại biểu mẫu, quý khách chỉ cần mô tả ngắn gọn tình trạng hồ sơ. Nếu cần xem giấy tờ để kiểm tra kỹ hơn, nhân viên SGM sẽ trao đổi với quý khách về cách gửi thuận tiện nhất.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Hỗ trợ hồ sơ và thủ tục xe",
    description,
    url: PAGE_URL,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: { "@type": "City", name: "TP. Hồ Chí Minh" },
    serviceType: "Hỗ trợ hồ sơ và thủ tục xe",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

export default function ConsultationLandingPage() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <div className={styles.page}>
      <Script
        id="consultation-google-ads-library"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="consultation-google-ads-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`}
      </Script>
      {gtmId ? (
        <Script id="consultation-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      ) : null}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href={PAGE_PATH} aria-label="Saigon Motor - Hỗ trợ hồ sơ và thủ tục xe">
            <Image src="/logo_sgm.png" width={54} height={54} alt="Saigon Motor" priority />
            <span><strong>SAIGON <em>MOTOR</em></strong><small>{LEGAL_NAME}</small></span>
          </Link>
          <nav aria-label="Nội dung trang hỗ trợ hồ sơ xe">
            <a href="#truong-hop">Trường hợp hỗ trợ</a>
            <a href="#quy-trinh">Quy trình và phạm vi</a>
            <a href="#cau-hoi">Câu hỏi thường gặp</a>
          </nav>
          <TrackedAnchor
            className={styles.headerCall}
            href="tel:0704104104"
            eventName="call_click"
            placement="consultation_header"
            eventData={trackingData}
          >
            Gọi 0704 104 104
          </TrackedAnchor>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Dịch vụ hỗ trợ hồ sơ xe</span>
              <h1>Đồng hành cùng quý khách trong từng bước hồ sơ, thủ tục xe</h1>
              <p className={styles.heroLead}>
                Saigon Motor kiểm tra hồ sơ xe, chỉ rõ những giấy tờ còn thiếu và tiếp nhận thực hiện các phần việc hai bên đã thống nhất. Ở những khâu pháp luật cho phép ủy quyền, chúng tôi có thể thay mặt quý khách làm việc theo hợp đồng dịch vụ hoặc giấy ủy quyền hợp lệ, giúp quý khách giảm bớt thời gian đi lại.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#dang-ky">Gửi thông tin để SGM kiểm tra hồ sơ</a>
                <TrackedAnchor
                  className={styles.secondaryButton}
                  href="https://zalo.me/0704104104"
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="zalo_click"
                  placement="consultation_hero"
                  eventData={trackingData}
                >
                  Trao đổi qua Zalo
                </TrackedAnchor>
              </div>
              <div className={styles.privateNotice}>
                <strong>Điều quý khách nên biết</strong>
                <p>Saigon Motor là đơn vị dịch vụ tư nhân, không phải cơ quan nhà nước. Chúng tôi hỗ trợ quý khách chuẩn bị, rà soát hồ sơ xe và thay mặt quý khách thực hiện những phần việc được ủy quyền. Quý khách vẫn có thể tự thực hiện thủ tục trực tiếp tại cơ quan có thẩm quyền.</p>
              </div>
            </div>

            <div className={styles.reviewCard} aria-label="Phạm vi công việc SGM đảm nhận">
              <div className={styles.reviewTop}><span>Phạm vi dịch vụ</span><strong>Thống nhất rõ trước khi tiếp nhận hồ sơ</strong></div>
              <ol>
                <li><span>01</span><div><strong>Kiểm tra hồ sơ</strong><p>Xem xét tình trạng xe, thông tin chủ xe và những giấy tờ quý khách đang có.</p></div></li>
                <li><span>02</span><div><strong>Báo phí rõ ràng</strong><p>Nêu rõ phần việc SGM đảm nhận, phần quý khách cần phối hợp và từng khoản chi phí dự kiến.</p></div></li>
                <li><span>03</span><div><strong>Thực hiện hồ sơ</strong><p>Hoàn thiện hồ sơ và thay mặt quý khách ở những khâu được phép ủy quyền.</p></div></li>
                <li><span>04</span><div><strong>Bàn giao kết quả</strong><p>Cập nhật tiến độ và bàn giao kết quả do cơ quan có thẩm quyền cấp.</p></div></li>
              </ol>
              <div className={styles.reviewFoot}>Cơ quan có thẩm quyền xem xét và quyết định kết quả hồ sơ</div>
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Thông tin doanh nghiệp">
          <div>
            <span>Đội ngũ có <strong>15 năm</strong> kinh nghiệm thực tế</span>
            <span>Mã số doanh nghiệp <strong>0316339254</strong></span>
            <span>Phục vụ khách hàng <strong>cá nhân và doanh nghiệp</strong> tại TP.HCM</span>
          </div>
        </section>

        <section className={styles.section} id="truong-hop">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Những trường hợp SGM thường hỗ trợ</span>
              <h2>Thời gian eo hẹp hay hồ sơ còn điểm chưa rõ, SGM sẵn lòng đồng hành cùng quý khách</h2>
              <p>Chúng tôi xem xét kỹ từng trường hợp trước khi đề xuất hướng xử lý. Khi hai bên đã thống nhất phương án, phạm vi công việc và chi phí, SGM trực tiếp thực hiện những phần việc đã thỏa thuận, thay vì chỉ hướng dẫn để quý khách tự xoay xở.</p>
            </div>
            <div className={styles.caseGrid}>
              <article><span>01</span><h3>Mua bán, tặng cho hoặc nhận thừa kế xe</h3><p>Kiểm tra thông tin chủ xe, giấy đăng ký và giấy tờ giao dịch, sau đó hỗ trợ quý khách chuẩn bị hồ sơ cho bước tiếp theo.</p></article>
              <article><span>02</span><h3>Xe đã qua nhiều lần mua bán</h3><p>Xác định giấy tờ còn thiếu qua từng lần chuyển nhượng, những điểm cần xác minh và hướng hoàn thiện hồ sơ trước khi bắt đầu thực hiện.</p></article>
              <article><span>03</span><h3>Thông tin trên các giấy tờ không khớp</h3><p>Đối chiếu tên, địa chỉ và đặc điểm xe; chỉ rõ phần cần bổ sung và hỗ trợ hoàn thiện hồ sơ khi đã xác định được hướng xử lý.</p></article>
              <article><span>04</span><h3>Doanh nghiệp cần hoàn thiện hồ sơ cho nhiều xe</h3><p>Rà soát hồ sơ pháp nhân, người có thẩm quyền ký và danh sách phương tiện; thống nhất đầu mối liên hệ và tiến độ cho từng xe.</p></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="quy-trinh">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Quy trình làm việc</span>
              <h2>Quý khách nắm rõ phần việc và chi phí trước khi giao hồ sơ</h2>
            </div>
            <div className={styles.processGrid}>
              <div><span>1</span><h3>Tiếp nhận thông tin</h3><p>Ghi nhận tình trạng xe, thông tin chủ xe, giấy tờ hiện có và thủ tục quý khách cần hoàn tất.</p></div>
              <div><span>2</span><h3>Kiểm tra hồ sơ</h3><p>Đối chiếu thông tin, xác định giấy tờ còn thiếu, những điểm tiềm ẩn rủi ro và nội dung cần xác minh.</p></div>
              <div><span>3</span><h3>Báo phí rõ ràng</h3><p>Giải thích quy trình, nêu rõ phần việc SGM đảm nhận, phần quý khách cần phối hợp và chi phí dự kiến.</p></div>
              <div><span>4</span><h3>Thực hiện hồ sơ</h3><p>Chúng tôi hoàn thiện hồ sơ và thực hiện những công việc đã thỏa thuận hoặc được ủy quyền hợp lệ.</p></div>
              <div><span>5</span><h3>Bàn giao kết quả</h3><p>Cập nhật tiến độ, thông báo khi hồ sơ cần bổ sung và bàn giao kết quả do cơ quan có thẩm quyền cấp.</p></div>
            </div>
            <div className={styles.scopeBox}>
              <div>
                <strong>Phần việc SGM đảm nhận</strong>
                <ul>
                  <li>Kiểm tra giấy tờ và đánh giá sơ bộ tình trạng hồ sơ.</li>
                  <li>Thông báo rõ phí dịch vụ, lệ phí nhà nước và các khoản có thể phát sinh trước khi tiếp nhận hồ sơ.</li>
                  <li>Chuẩn bị, sắp xếp và hoàn thiện hồ sơ trong phạm vi đã thống nhất.</li>
                  <li>Thay mặt quý khách thực hiện những công việc được phép ủy quyền, khi đã có giấy ủy quyền hợp lệ.</li>
                  <li>Theo dõi tiến độ, thông báo khi cần bổ sung và bàn giao kết quả do cơ quan có thẩm quyền cấp.</li>
                </ul>
              </div>
              <div>
                <strong>Quý khách cần phối hợp</strong>
                <ul>
                  <li>Cung cấp đầy đủ, trung thực thông tin về xe, chủ xe và nguồn gốc giấy tờ.</li>
                  <li>Ký hợp đồng dịch vụ và giấy ủy quyền khi phương án thực hiện cần đến.</li>
                  <li>Trực tiếp ký, xuất trình bản gốc hoặc có mặt ở những bước quy định bắt buộc chủ xe thực hiện.</li>
                  <li>Nộp lệ phí, thuế theo thông báo của cơ quan có thẩm quyền.</li>
                </ul>
              </div>
              <div>
                <strong>Thuộc thẩm quyền cơ quan nhà nước</strong>
                <ul>
                  <li>Tiếp nhận, xem xét và phê duyệt hồ sơ hành chính.</li>
                  <li>Cấp giấy đăng ký, biển số hoặc giấy tờ chính thức.</li>
                  <li>Quyết định kết quả và thời gian giải quyết.</li>
                </ul>
              </div>
            </div>
            <p className={styles.legalNote}>
              Theo giấy xác nhận đăng ký doanh nghiệp, {LEGAL_NAME} có đăng ký ngành 8299 với nội dung “Hỗ trợ đăng ký xe cơ giới”. Đây là ngành nghề công ty đã đăng ký kinh doanh, không phải văn bản ủy quyền hay chỉ định của cơ quan nhà nước. SGM chỉ đại diện quý khách khi hai bên đã thỏa thuận, quý khách có giấy ủy quyền hợp lệ và pháp luật cho phép.
            </p>
          </div>
        </section>

        <section className={styles.section} id="dang-ky">
          <div className={`${styles.sectionInner} ${styles.formLayout}`}>
            <div className={styles.formSide}>
              <span className={styles.eyebrow}>Chia sẻ trường hợp của quý khách</span>
              <h2>Quý khách chỉ cần mô tả ngắn gọn tình trạng hồ sơ</h2>
              <p>Chúng tôi sẽ liên hệ lại để trao đổi kỹ hơn. Quý khách chưa cần tải ảnh giấy tờ lên website và chỉ giao hồ sơ khi đã đồng ý với phương án SGM đề xuất.</p>
              <div className={styles.contactCard}>
                <span>Hotline/Zalo</span>
                <strong>0704 104 104</strong>
                <small>Hotline nhận cuộc gọi 24/7. Với yêu cầu gửi qua biểu mẫu, SGM phản hồi trong giờ làm việc.</small>
              </div>
            </div>
            <ConsultationLeadForm />
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="cau-hoi">
          <div className={styles.narrowInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Câu hỏi thường gặp</span>
              <h2>Đôi điều quý khách nên biết trước khi giao hồ sơ</h2>
            </div>
            <div className={styles.faqList}>
              {faqs.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sources}>
          <div className={styles.sectionInner}>
            <div>
              <span className={styles.eyebrow}>Nguồn chính thức</span>
              <h2>Quý khách hoàn toàn có thể tự tra cứu và thực hiện thủ tục</h2>
              <p>Sử dụng dịch vụ của SGM là lựa chọn của quý khách, không phải yêu cầu bắt buộc. Dù tự thực hiện hay giao SGM hỗ trợ, quý khách vẫn nên đối chiếu thông tin trên cổng chính thức của cơ quan có thẩm quyền.</p>
            </div>
            <div className={styles.sourceLinks}>
              <a href="https://dichvucong.bocongan.gov.vn/bocongan/bothutuc/listThuTuc?linh_vuc=PT_GIAO_THONG&muc_do=MUC_DO_3" target="_blank" rel="noopener noreferrer">Cổng Dịch vụ công Bộ Công an <span>↗</span></a>
              <a href="https://dichvucong.gov.vn/" target="_blank" rel="noopener noreferrer">Cổng Dịch vụ công Quốc gia <span>↗</span></a>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div><strong>Saigon Motor</strong><p>Đơn vị dịch vụ thuộc {LEGAL_NAME}</p></div>
          <div><span>MST 0316339254</span><span>745 Phạm Văn Đồng, Khu phố 8, phường Hiệp Bình, TP. Hồ Chí Minh</span></div>
          <div><Link href="/phap-ly-cam-ket">Thông tin pháp lý</Link><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link></div>
        </div>
      </footer>

      <div className={styles.mobileRail} aria-label="Liên hệ nhanh">
        <TrackedAnchor href="tel:0704104104" eventName="call_click" placement="consultation_sticky" eventData={trackingData}>Gọi SGM</TrackedAnchor>
        <TrackedAnchor href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" eventName="zalo_click" placement="consultation_sticky" eventData={trackingData}>Nhắn Zalo</TrackedAnchor>
      </div>
    </div>
  );
}
