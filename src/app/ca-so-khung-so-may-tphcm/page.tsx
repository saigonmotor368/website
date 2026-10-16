import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import TrackedAnchor from "@/components/TrackedAnchor";
import { OG_IMAGE, serializeJsonLd, SITE_URL } from "@/lib/seo";
import FrameNumberLeadForm from "./FrameNumberLeadForm";
import styles from "../tu-van-ho-so-xe/page.module.css";

const PAGE_PATH = "/ca-so-khung-so-may-tphcm";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const GOOGLE_ADS_ID = "AW-18352281213";
const title = "Cà số khung, số máy tận nơi tại TP.HCM";
const description =
  "Saigon Motor cà số khung, số máy ô tô và xe máy tận nơi tại TP.HCM. Xe máy từ 300.000 đồng, ô tô từ 500.000 đồng, báo phí rõ ràng trước khi hẹn lịch.";

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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Saigon Motor hỗ trợ cà số khung, số máy" }],
  },
};

const trackingData = {
  service_slug: "ca-so-khung-so-may",
  service_group: "technical",
  page_path: PAGE_PATH,
};

const faqs = [
  {
    question: "SGM có hỗ trợ cà số tận nơi quý khách để xe không?",
    answer:
      "Có. SGM hỗ trợ cà số khung, số máy tận nơi tại TP.HCM. Trước khi xác nhận lịch hẹn, chúng tôi sẽ hỏi quý khách về loại xe, nơi đang để xe và không gian thao tác tại đó. Nếu phát sinh chi phí đi lại, SGM sẽ thông báo trước để quý khách cân nhắc.",
  },
  {
    question: "Chi phí cà số khung, số máy được tính như thế nào?",
    answer:
      "Với trường hợp thông thường tại TP.HCM, giá tham khảo từ 300.000 đồng cho xe máy và từ 500.000 đồng cho ô tô. Chi phí có thể thay đổi tùy nơi để xe, mức độ khó dễ khi tiếp cận vị trí đóng số và tình trạng bề mặt số. SGM luôn báo phí trước; chỉ khi quý khách đồng ý, chúng tôi mới đặt lịch.",
  },
  {
    question: "Số khung hoặc số máy bị mờ thì SGM xử lý ra sao?",
    answer:
      "SGM không đục sửa hay làm thay đổi số nhận dạng của xe. Trường hợp số khó đọc, có dấu hiệu bất thường hoặc không khớp với giấy tờ, chúng tôi sẽ tạm dừng và thông báo để quý khách kiểm tra theo đúng quy định.",
  },
  {
    question: "Bản chà có thay thế việc xác nhận của cơ quan có thẩm quyền không?",
    answer:
      "Không. SGM chỉ thực hiện bản chà ở những vị trí có thể thao tác an toàn. Việc bản chà có được chấp nhận trong hồ sơ hay không do cơ quan tiếp nhận có thẩm quyền quyết định.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Cà số khung, số máy ô tô và xe máy",
    description,
    url: PAGE_URL,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: { "@type": "City", name: "TP. Hồ Chí Minh" },
    serviceType: "Cà số khung, số máy",
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

export default function FrameNumberLandingPage() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <div className={styles.page}>
      <Script
        id="frame-number-google-ads-library"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="frame-number-google-ads-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`}
      </Script>
      {gtmId ? (
        <Script id="frame-number-gtm" strategy="afterInteractive">
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
          <Link className={styles.brand} href={PAGE_PATH} aria-label="Saigon Motor - Cà số khung, số máy">
            <Image src="/logo_sgm.png" width={54} height={54} alt="Saigon Motor" priority />
            <span><strong>SAIGON <em>MOTOR</em></strong><small>Công ty TNHH Ô tô Xe máy 368</small></span>
          </Link>
          <nav aria-label="Nội dung trang cà số khung, số máy">
            <a href="#truong-hop">Trường hợp hỗ trợ</a>
            <a href="#quy-trinh">Chi phí và lịch hẹn</a>
            <a href="#cau-hoi">Câu hỏi thường gặp</a>
          </nav>
          <TrackedAnchor className={styles.headerCall} href="tel:0704104104" eventName="call_click" placement="frame_number_header" eventData={trackingData}>
            Gọi 0704 104 104
          </TrackedAnchor>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Cà số khung, số máy tận nơi tại TP.HCM</span>
              <h1>Cà số khung, số máy tận nơi, báo phí rõ ràng trước khi hẹn lịch</h1>
              <p className={styles.heroLead}>
                Saigon Motor đến tận nơi, xác định đúng vị trí đóng số, thực hiện bản chà rõ nét và đối chiếu cẩn thận với giấy tờ xe quý khách cung cấp. Trước khi xác nhận lịch hẹn, chúng tôi trao đổi về loại xe, nơi đang để xe và báo phí rõ ràng để quý khách an tâm quyết định.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#dang-ky">Gửi thông tin để nhận báo phí</a>
                <TrackedAnchor className={styles.secondaryButton} href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" eventName="zalo_click" placement="frame_number_hero" eventData={trackingData}>
                  Nhắn Zalo cho SGM
                </TrackedAnchor>
              </div>
              <div className={styles.privateNotice}>
                <strong>Nguyên tắc làm việc của SGM</strong>
                <p>Chúng tôi chỉ thực hiện bản chà khi có thể thao tác an toàn, không đục sửa hay làm thay đổi số nhận dạng của xe. Nếu số khó đọc hoặc không khớp với giấy tờ, SGM sẽ thông báo ngay để quý khách kiểm tra.</p>
              </div>
            </div>

            <div className={styles.reviewCard} aria-label="Quy trình đặt lịch cà số khung, số máy">
              <div className={styles.reviewTop}><span>Đặt lịch cà số</span><strong>Trao đổi rõ ràng trước khi thực hiện</strong></div>
              <ol>
                <li><span>01</span><div><strong>Tiếp nhận thông tin</strong><p>Quý khách cho biết loại xe, dòng xe và khu vực đang để xe.</p></div></li>
                <li><span>02</span><div><strong>Khảo sát vị trí đóng số</strong><p>SGM xác định vị trí đóng số và điều kiện tiếp cận an toàn.</p></div></li>
                <li><span>03</span><div><strong>Báo phí rõ ràng</strong><p>Chúng tôi báo chi phí dự kiến để quý khách cân nhắc trước khi hẹn lịch.</p></div></li>
                <li><span>04</span><div><strong>Thực hiện và bàn giao kết quả</strong><p>SGM kiểm tra độ rõ nét của bản chà và đối chiếu với thông tin quý khách đã cung cấp.</p></div></li>
              </ol>
              <div className={styles.reviewFoot}>Không đục sửa, không làm thay đổi số nhận dạng của xe</div>
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Thông tin dịch vụ">
          <div>
            <span>Xe máy <strong>từ 300.000 đồng</strong></span>
            <span>Ô tô <strong>từ 500.000 đồng</strong></span>
            <span>Thực hiện <strong>tận nơi tại TP.HCM</strong></span>
          </div>
        </section>

        <section className={styles.section} id="truong-hop">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Những trường hợp SGM thường hỗ trợ</span>
              <h2>Mỗi dòng xe có vị trí đóng số riêng, nên SGM luôn tìm hiểu kỹ trước khi hẹn lịch</h2>
              <p>Trước khi nhận lịch, chúng tôi cần biết loại xe, nơi đang để xe và tình trạng vị trí đóng số để chuẩn bị chu đáo.</p>
            </div>
            <div className={styles.caseGrid}>
              <article><span>01</span><h3>Chưa rõ vị trí đóng số</h3><p>SGM tra cứu theo dòng xe để xác định đúng vị trí số khung, số máy trước khi thao tác.</p></article>
              <article><span>02</span><h3>Vị trí đóng số khó tiếp cận</h3><p>Một số dòng xe cần thêm không gian hoặc khâu chuẩn bị để chúng tôi thực hiện bản chà an toàn.</p></article>
              <article><span>03</span><h3>Số đóng bị mờ, khó đọc</h3><p>Chúng tôi kiểm tra tình trạng thực tế và tạm dừng nếu nhận thấy dấu hiệu cần xác minh chuyên môn.</p></article>
              <article><span>04</span><h3>Cần đối chiếu với giấy tờ xe</h3><p>SGM đối chiếu thông tin trên bản chà với giấy tờ quý khách cung cấp và thông báo nếu có điểm chưa thống nhất.</p></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="quy-trinh">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Chi phí và lịch hẹn</span>
              <h2>Quý khách nắm rõ chi phí trước khi hẹn lịch</h2>
              <p>Với trường hợp thông thường tại TP.HCM, giá tham khảo từ 300.000 đồng cho xe máy và từ 500.000 đồng cho ô tô. Nếu xe ở xa, vị trí đóng số khó tiếp cận hoặc bề mặt cần xử lý thêm, SGM sẽ báo trước để quý khách cân nhắc. Khi hai bên đã thống nhất, chúng tôi không tự ý phát sinh thêm chi phí.</p>
            </div>
            <div className={styles.scopeBox}>
              <div><strong>Thông tin quý khách vui lòng cung cấp</strong><ul><li>Loại xe và dòng xe.</li><li>Khu vực đang để xe.</li><li>Tình trạng số khung, số máy, nếu quý khách đã quan sát.</li></ul></div>
              <div><strong>SGM sẽ thông báo</strong><ul><li>Có thể sắp xếp lịch thực hiện hay không.</li><li>Chi phí dự kiến và phí đi lại, nếu có.</li><li>Thời gian hẹn và những điều cần chuẩn bị tại nơi để xe.</li></ul></div>
              <div><strong>Quý khách vui lòng chuẩn bị</strong><ul><li>Để xe ở nơi an toàn, đủ không gian thao tác.</li><li>Mang theo giấy tờ xe để đối chiếu khi cần.</li><li>Không tự đục sửa hay tác động lên số khung, số máy.</li></ul></div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="dang-ky">
          <div className={`${styles.sectionInner} ${styles.formLayout}`}>
            <div className={styles.formSide}>
              <span className={styles.eyebrow}>Đặt lịch cùng SGM</span>
              <h2>Gửi thông tin xe, SGM sẽ liên hệ báo phí và sắp xếp lịch hẹn</h2>
              <p>Quý khách chưa cần tải giấy tờ lên website. Chúng tôi sẽ trao đổi thêm những thông tin cần thiết và chỉ xác nhận lịch khi hai bên đã thống nhất chi phí.</p>
              <div className={styles.contactCard}><span>Hotline/Zalo</span><strong>0704 104 104</strong><small>Hotline nhận cuộc gọi 24/7. Yêu cầu gửi qua form sẽ được SGM phản hồi trong giờ làm việc.</small></div>
            </div>
            <FrameNumberLeadForm />
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="cau-hoi">
          <div className={styles.narrowInner}>
            <div className={styles.sectionIntro}><span className={styles.eyebrow}>Câu hỏi thường gặp</span><h2>Những điều quý khách thường quan tâm trước khi đặt lịch</h2></div>
            <div className={styles.faqList}>
              {faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div><strong>Saigon Motor</strong><p>Đơn vị dịch vụ tư nhân thuộc Công ty TNHH Ô tô Xe máy 368, không phải cơ quan nhà nước</p></div>
          <div><span>MST 0316339254</span><span>745 Phạm Văn Đồng, Khu phố 8, phường Hiệp Bình, TP. Hồ Chí Minh</span></div>
          <div><Link href="/phap-ly-cam-ket">Thông tin pháp lý</Link><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link></div>
        </div>
      </footer>

      <div className={styles.mobileRail} aria-label="Liên hệ nhanh">
        <TrackedAnchor href="tel:0704104104" eventName="call_click" placement="frame_number_sticky" eventData={trackingData}>Gọi SGM</TrackedAnchor>
        <TrackedAnchor href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" eventName="zalo_click" placement="frame_number_sticky" eventData={trackingData}>Nhắn Zalo</TrackedAnchor>
      </div>
    </div>
  );
}
