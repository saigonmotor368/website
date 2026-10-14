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
const title = "Hỗ trợ hồ sơ và thủ tục xe tại TP.HCM";
const description =
  "Saigon Motor kiểm tra tình trạng hồ sơ, báo rõ phần việc và chi phí, đồng thời hỗ trợ khách hàng thực hiện thủ tục theo thỏa thuận hoặc ủy quyền hợp lệ. SGM là đơn vị tư nhân, không phải cơ quan nhà nước.";

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
    question: "SGM có phải cơ quan đăng ký xe không?",
    answer:
      `Không. Saigon Motor là đơn vị dịch vụ tư nhân thuộc ${LEGAL_NAME}. SGM hỗ trợ khách hàng chuẩn bị hồ sơ và thực hiện thủ tục trong phạm vi pháp luật cho phép. Việc tiếp nhận, phê duyệt và cấp giấy đăng ký, biển số hoặc giấy tờ khác thuộc cơ quan có thẩm quyền.`,
  },
  {
    question: "SGM chỉ tư vấn hay có nhận thực hiện hồ sơ?",
    answer:
      "SGM không chỉ dừng ở việc tư vấn. Sau khi kiểm tra hồ sơ và thống nhất phương án, SGM có thể nhận chuẩn bị, hoàn thiện và thực hiện các công việc đã thỏa thuận. Ở những khâu pháp luật cho phép ủy quyền, SGM có thể đại diện anh/chị làm việc theo hợp đồng dịch vụ hoặc giấy ủy quyền hợp lệ. Nếu quy định yêu cầu chủ xe trực tiếp ký, xuất trình bản gốc hoặc có mặt, SGM sẽ thông báo trước để anh/chị sắp xếp.",
  },
  {
    question: "Trong trường hợp nào SGM có thể đại diện cho tôi?",
    answer:
      "SGM chỉ đại diện anh/chị khi hai bên đã thống nhất rõ phạm vi công việc, anh/chị cung cấp giấy ủy quyền hợp lệ nếu thủ tục yêu cầu và quy định hiện hành cho phép người được ủy quyền thực hiện công việc đó.",
  },
  {
    question: "Chi phí dịch vụ được tính như thế nào?",
    answer:
      "Chi phí được tách thành phí dịch vụ của SGM, lệ phí hoặc thuế phải nộp theo thông báo của cơ quan có thẩm quyền và những khoản có thể phát sinh theo tình trạng thực tế của hồ sơ. SGM sẽ thông báo rõ trước khi tiếp nhận.",
  },
  {
    question: "SGM có bảo đảm hồ sơ được chấp thuận không?",
    answer:
      "SGM chịu trách nhiệm thực hiện đúng phạm vi dịch vụ đã thống nhất, cập nhật tiến độ và thông báo khi hồ sơ cần bổ sung. Việc chấp thuận hồ sơ và thời gian giải quyết do cơ quan có thẩm quyền quyết định, vì vậy SGM không hứa trước kết quả.",
  },
  {
    question: "Tôi có phải gửi ảnh giấy tờ trên website không?",
    answer:
      "Không. Biểu mẫu chỉ tiếp nhận thông tin mô tả ban đầu. Nếu cần xem giấy tờ để kiểm tra kỹ hơn, nhân viên sẽ thống nhất với anh/chị kênh gửi phù hợp.",
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
              <h1>Anh/chị cần làm thủ tục giấy tờ xe nhưng chưa biết bắt đầu từ đâu?</h1>
              <p className={styles.heroLead}>
                Saigon Motor kiểm tra tình trạng hồ sơ, hướng dẫn bổ sung giấy tờ còn thiếu và nhận thực hiện những phần việc hai bên đã thống nhất. Ở những khâu pháp luật cho phép ủy quyền, SGM có thể đại diện anh/chị làm việc theo hợp đồng dịch vụ hoặc giấy ủy quyền hợp lệ.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#dang-ky">Gửi thông tin để SGM kiểm tra</a>
                <TrackedAnchor
                  className={styles.secondaryButton}
                  href="https://zalo.me/0704104104"
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="zalo_click"
                  placement="consultation_hero"
                  eventData={trackingData}
                >
                  Nhắn Zalo cho SGM
                </TrackedAnchor>
              </div>
              <div className={styles.privateNotice}>
                <strong>Thông tin minh bạch</strong>
                <p>Saigon Motor là đơn vị dịch vụ tư nhân thuộc {LEGAL_NAME}, không phải cơ quan nhà nước. SGM hỗ trợ chuẩn bị và thực hiện hồ sơ trong phạm vi pháp luật cho phép; cơ quan có thẩm quyền là đơn vị tiếp nhận hành chính, xem xét và cấp kết quả.</p>
              </div>
            </div>

            <div className={styles.reviewCard} aria-label="Phạm vi công việc SGM đảm nhận">
              <div className={styles.reviewTop}><span>Phạm vi dịch vụ</span><strong>Thống nhất trước khi tiếp nhận</strong></div>
              <ol>
                <li><span>01</span><div><strong>Kiểm tra hồ sơ</strong><p>Xem tình trạng xe, thông tin chủ xe và giấy tờ đang có.</p></div></li>
                <li><span>02</span><div><strong>Thống nhất công việc và chi phí</strong><p>Nêu rõ phần việc SGM đảm nhận, nội dung anh/chị cần phối hợp và từng khoản chi phí dự kiến.</p></div></li>
                <li><span>03</span><div><strong>Chuẩn bị và thực hiện hồ sơ</strong><p>Hoàn thiện hồ sơ và đại diện anh/chị ở những khâu được phép ủy quyền.</p></div></li>
                <li><span>04</span><div><strong>Theo dõi tiến độ và bàn giao</strong><p>Cập nhật quá trình xử lý và bàn giao kết quả do cơ quan có thẩm quyền cấp.</p></div></li>
              </ol>
              <div className={styles.reviewFoot}>Cơ quan có thẩm quyền xem xét và quyết định kết quả hồ sơ</div>
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Thông tin doanh nghiệp">
          <div>
            <span>Đội ngũ có <strong>15 năm</strong> kinh nghiệm thực tế</span>
            <span>Mã số doanh nghiệp <strong>0316339254</strong></span>
            <span>Phục vụ <strong>cá nhân và doanh nghiệp</strong> tại TP.HCM</span>
          </div>
        </section>

        <section className={styles.section} id="truong-hop">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Trường hợp SGM thường hỗ trợ</span>
              <h2>Anh/chị đang bận, chưa rõ quy trình hoặc hồ sơ có điểm cần tháo gỡ?</h2>
              <p>SGM kiểm tra từng trường hợp trước khi đề xuất phương án. Khi hai bên đã thống nhất cách thực hiện, phạm vi công việc và chi phí, SGM sẽ nhận thực hiện những phần việc đã thỏa thuận thay vì chỉ hướng dẫn anh/chị tự xử lý.</p>
            </div>
            <div className={styles.caseGrid}>
              <article><span>01</span><h3>Mua bán, tặng cho hoặc nhận thừa kế xe</h3><p>Kiểm tra thông tin chủ xe, giấy đăng ký và chứng từ giao dịch, sau đó hỗ trợ chuẩn bị hồ sơ cho bước tiếp theo.</p></article>
              <article><span>02</span><h3>Xe đã qua nhiều lần mua bán</h3><p>Xác định giấy tờ còn thiếu trong từng lần chuyển nhượng, nội dung cần xác minh và phương án hoàn thiện hồ sơ trước khi thực hiện.</p></article>
              <article><span>03</span><h3>Thông tin trên các giấy tờ không khớp</h3><p>Đối chiếu tên, địa chỉ và đặc điểm xe; hướng dẫn bổ sung và hỗ trợ hoàn thiện hồ sơ sau khi đã xác định hướng xử lý.</p></article>
              <article><span>04</span><h3>Doanh nghiệp cần xử lý nhiều xe</h3><p>Rà soát hồ sơ pháp nhân, người có thẩm quyền ký và danh sách phương tiện; thống nhất đầu mối liên hệ và tiến độ cho từng xe.</p></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="quy-trinh">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Quy trình làm việc</span>
              <h2>Thống nhất rõ phần việc và chi phí trước khi tiếp nhận hồ sơ</h2>
            </div>
            <div className={styles.processGrid}>
              <div><span>1</span><h3>Tiếp nhận nhu cầu</h3><p>Ghi nhận tình trạng xe, chủ xe, giấy tờ đang có và việc anh/chị cần hoàn tất.</p></div>
              <div><span>2</span><h3>Kiểm tra hồ sơ</h3><p>Đối chiếu thông tin, xác định giấy tờ còn thiếu, rủi ro và nội dung cần xác minh.</p></div>
              <div><span>3</span><h3>Thống nhất phương án</h3><p>Giải thích quy trình, phần việc SGM đảm nhận, phần anh/chị cần phối hợp và chi phí dự kiến.</p></div>
              <div><span>4</span><h3>Chuẩn bị và thực hiện</h3><p>SGM hoàn thiện hồ sơ và thực hiện những công việc đã thỏa thuận hoặc được ủy quyền hợp lệ.</p></div>
              <div><span>5</span><h3>Theo dõi và bàn giao</h3><p>Cập nhật tiến độ, báo yêu cầu bổ sung nếu có và bàn giao kết quả do cơ quan có thẩm quyền cấp.</p></div>
            </div>
            <div className={styles.scopeBox}>
              <div>
                <strong>SGM thực hiện theo thỏa thuận</strong>
                <ul>
                  <li>Kiểm tra giấy tờ và đánh giá sơ bộ tình trạng hồ sơ.</li>
                  <li>Thông báo rõ phí dịch vụ, lệ phí nhà nước và khoản có thể phát sinh trước khi tiếp nhận.</li>
                  <li>Chuẩn bị, sắp xếp và hoàn thiện hồ sơ trong phạm vi đã thống nhất.</li>
                  <li>Đại diện anh/chị thực hiện những công việc được phép ủy quyền, trên cơ sở hồ sơ ủy quyền hợp lệ.</li>
                  <li>Theo dõi tiến độ, thông báo khi cần bổ sung và bàn giao kết quả do cơ quan có thẩm quyền cấp.</li>
                </ul>
              </div>
              <div>
                <strong>Anh/chị cần phối hợp</strong>
                <ul>
                  <li>Cung cấp đầy đủ, trung thực thông tin về xe, chủ xe và nguồn gốc giấy tờ.</li>
                  <li>Ký hợp đồng dịch vụ và giấy ủy quyền khi phương án thực hiện yêu cầu.</li>
                  <li>Trực tiếp ký, xuất trình bản gốc hoặc có mặt ở những bước quy định bắt buộc chủ xe thực hiện.</li>
                  <li>Thực hiện các nghĩa vụ về lệ phí, thuế theo thông báo của cơ quan có thẩm quyền.</li>
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
              Theo giấy xác nhận đăng ký doanh nghiệp, {LEGAL_NAME} có đăng ký ngành 8299 với nội dung “Hỗ trợ đăng ký xe cơ giới”. Đây là phạm vi ngành nghề doanh nghiệp đã đăng ký, không phải văn bản ủy quyền hoặc chỉ định của cơ quan nhà nước. SGM chỉ đại diện khách hàng khi có thỏa thuận phù hợp, giấy ủy quyền hợp lệ và quy định pháp luật cho phép.
            </p>
          </div>
        </section>

        <section className={styles.section} id="dang-ky">
          <div className={`${styles.sectionInner} ${styles.formLayout}`}>
            <div className={styles.formSide}>
              <span className={styles.eyebrow}>Trao đổi trường hợp của anh/chị</span>
              <h2>Anh/chị chỉ cần mô tả ngắn tình trạng hồ sơ</h2>
              <p>SGM sẽ liên hệ để hỏi kỹ hơn, sau đó thông báo phương án, phạm vi công việc và chi phí dự kiến. Anh/chị chưa cần tải ảnh giấy tờ lên website và chỉ giao hồ sơ khi đã đồng ý với phương án.</p>
              <div className={styles.contactCard}>
                <span>Hotline/Zalo</span>
                <strong>0704 104 104</strong>
                <small>Hotline nhận cuộc gọi 24/7. Yêu cầu qua form được xử lý trong khung giờ làm việc.</small>
              </div>
            </div>
            <ConsultationLeadForm />
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="cau-hoi">
          <div className={styles.narrowInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Câu hỏi thường gặp</span>
              <h2>Những điều anh/chị nên biết trước khi giao hồ sơ</h2>
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
              <h2>Anh/chị có thể tự tra cứu và thực hiện thủ tục</h2>
              <p>Sử dụng dịch vụ của SGM là lựa chọn của anh/chị, không phải yêu cầu bắt buộc. Dù tự thực hiện hay giao SGM hỗ trợ, anh/chị vẫn nên đối chiếu thông tin tại cổng chính thức của cơ quan có thẩm quyền.</p>
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
          <div><strong>Saigon Motor</strong><p>Nhánh dịch vụ của {LEGAL_NAME}</p></div>
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
