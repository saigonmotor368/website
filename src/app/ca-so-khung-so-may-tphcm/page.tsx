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
  "Saigon Motor nhận cà số khung, số máy tận nơi cho ô tô và xe máy tại TP.HCM. Xe máy từ 300.000 đồng, ô tô từ 500.000 đồng; báo phí trước khi đặt lịch.";

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
    question: "SGM có thể sắp xếp theo vị trí phương tiện không?",
    answer:
      "Có. SGM nhận cà số khung, số máy tận nơi tại TP.HCM. Trước khi xác nhận lịch, SGM sẽ hỏi loại xe, địa điểm đang để phương tiện và điều kiện thao tác. Khoản di chuyển phát sinh, nếu có, được thông báo trước.",
  },
  {
    question: "Chi phí cà số khung, số máy được tính như thế nào?",
    answer:
      "Mức tham khảo cho trường hợp thông thường tại TP.HCM là từ 300.000 đồng đối với xe máy và từ 500.000 đồng đối với ô tô. Chi phí có thể thay đổi theo vị trí phương tiện, khả năng tiếp cận vị trí đóng số và tình trạng bề mặt; SGM sẽ xác nhận trước khi anh/chị đặt lịch.",
  },
  {
    question: "Nếu số khung hoặc số máy bị mờ thì xử lý thế nào?",
    answer:
      "SGM không đục sửa hoặc tác động làm thay đổi số nhận dạng. Nếu thông tin khó đọc, có dấu hiệu bất thường hoặc không khớp giấy tờ, SGM sẽ dừng thao tác và thông báo để anh/chị kiểm tra theo đúng quy định.",
  },
  {
    question: "Bản chà có thay thế việc xác nhận của cơ quan có thẩm quyền không?",
    answer:
      "Không. SGM chỉ thực hiện bản chà trong phạm vi kỹ thuật có thể thao tác an toàn. Việc chấp nhận tài liệu trong từng hồ sơ thuộc cơ quan tiếp nhận có thẩm quyền.",
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
            <a href="#quy-trinh">Quy trình thực hiện</a>
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
              <h1>Anh/chị cần cà số khung, số máy cho ô tô hoặc xe máy?</h1>
              <p className={styles.heroLead}>
                Saigon Motor đến tận nơi để xác định vị trí đóng số, thực hiện bản chà rõ nét và đối chiếu với giấy tờ anh/chị cung cấp. SGM kiểm tra loại xe, địa điểm đang để phương tiện và báo phí trước khi xác nhận lịch.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#dang-ky">Gửi thông tin để SGM báo phí</a>
                <TrackedAnchor className={styles.secondaryButton} href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" eventName="zalo_click" placement="frame_number_hero" eventData={trackingData}>
                  Nhắn Zalo cho SGM
                </TrackedAnchor>
              </div>
              <div className={styles.privateNotice}>
                <strong>Nguyên tắc thực hiện</strong>
                <p>SGM chỉ thực hiện bản chà trong điều kiện có thể thao tác an toàn, không đục sửa hoặc làm thay đổi số nhận dạng phương tiện. Nếu thông tin khó đọc hoặc không khớp giấy tờ, SGM sẽ thông báo ngay để anh/chị kiểm tra.</p>
              </div>
            </div>

            <div className={styles.reviewCard} aria-label="Quy trình đặt lịch cà số khung, số máy">
              <div className={styles.reviewTop}><span>Đặt lịch thực hiện</span><strong>Trao đổi rõ trước khi làm</strong></div>
              <ol>
                <li><span>01</span><div><strong>Gửi thông tin xe</strong><p>Loại xe, dòng xe và khu vực đang để phương tiện.</p></div></li>
                <li><span>02</span><div><strong>Kiểm tra khả năng thực hiện</strong><p>Xác định vị trí đóng số và điều kiện tiếp cận an toàn.</p></div></li>
                <li><span>03</span><div><strong>Xác nhận chi phí và lịch hẹn</strong><p>SGM thông báo chi phí dự kiến trước khi anh/chị quyết định.</p></div></li>
                <li><span>04</span><div><strong>Thực hiện và kiểm tra bản chà</strong><p>Đối chiếu độ rõ nét và thông tin khách hàng đã cung cấp.</p></div></li>
              </ol>
              <div className={styles.reviewFoot}>Không can thiệp, đục sửa hoặc thay đổi số nhận dạng phương tiện</div>
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Thông tin dịch vụ">
          <div>
            <span>Xe máy <strong>từ 300.000 đồng</strong></span>
            <span>Ô tô <strong>từ 500.000 đồng</strong></span>
            <span>Nhận thực hiện <strong>tận nơi tại TP.HCM</strong></span>
          </div>
        </section>

        <section className={styles.section} id="truong-hop">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Trường hợp SGM thường hỗ trợ</span>
              <h2>Mỗi dòng xe có vị trí đóng số và điều kiện thao tác khác nhau</h2>
              <p>SGM cần biết loại xe, vị trí phương tiện và tình trạng khu vực đóng số trước khi xác nhận khả năng thực hiện.</p>
            </div>
            <div className={styles.caseGrid}>
              <article><span>01</span><h3>Không xác định được vị trí đóng số</h3><p>SGM kiểm tra thông tin dòng xe để xác định vị trí số khung, số máy trước khi thao tác.</p></article>
              <article><span>02</span><h3>Vị trí đóng số khó tiếp cận</h3><p>Một số loại xe cần thêm không gian hoặc thao tác chuẩn bị để thực hiện bản chà an toàn.</p></article>
              <article><span>03</span><h3>Bề mặt đóng số khó đọc</h3><p>SGM kiểm tra tình trạng thực tế và dừng thao tác nếu phát hiện dấu hiệu cần xác minh chuyên môn.</p></article>
              <article><span>04</span><h3>Cần đối chiếu với giấy tờ xe</h3><p>Thông tin trên bản chà được đối chiếu với giấy tờ do anh/chị cung cấp; SGM thông báo nếu có điểm chưa thống nhất.</p></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="quy-trinh">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}>
              <span className={styles.eyebrow}>Chi phí và lịch hẹn</span>
              <h2>SGM xác nhận rõ trước khi anh/chị quyết định</h2>
              <p>Giá tham khảo cho trường hợp thông thường tại TP.HCM là từ 300.000 đồng đối với xe máy và từ 500.000 đồng đối với ô tô. Nếu địa điểm ở xa, vị trí đóng số khó tiếp cận hoặc bề mặt cần xử lý thêm, SGM sẽ báo lại trước; không tự ý phát sinh chi phí sau khi hai bên đã thống nhất.</p>
            </div>
            <div className={styles.scopeBox}>
              <div><strong>Thông tin SGM cần biết</strong><ul><li>Loại xe và dòng xe.</li><li>Khu vực đang để phương tiện.</li><li>Tình trạng số khung, số máy nếu anh/chị đã quan sát.</li></ul></div>
              <div><strong>SGM sẽ thông báo</strong><ul><li>Khả năng sắp xếp thực hiện.</li><li>Chi phí dự kiến và khoản di chuyển nếu có.</li><li>Thời gian và điều kiện cần chuẩn bị tại vị trí phương tiện.</li></ul></div>
              <div><strong>Anh/chị cần phối hợp</strong><ul><li>Bố trí phương tiện tại nơi an toàn, đủ không gian thao tác.</li><li>Cung cấp giấy tờ xe để đối chiếu khi cần.</li><li>Không tự đục sửa hoặc tác động lên số nhận dạng.</li></ul></div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="dang-ky">
          <div className={`${styles.sectionInner} ${styles.formLayout}`}>
            <div className={styles.formSide}>
              <span className={styles.eyebrow}>Đặt lịch cùng SGM</span>
              <h2>Gửi thông tin xe, SGM sẽ liên hệ để xác nhận</h2>
              <p>Anh/chị chưa cần tải giấy tờ lên website. SGM sẽ hỏi thêm những thông tin cần thiết và chỉ xác nhận lịch sau khi hai bên đã thống nhất chi phí.</p>
              <div className={styles.contactCard}><span>Hotline/Zalo</span><strong>0704 104 104</strong><small>Hotline nhận cuộc gọi 24/7. Yêu cầu qua form được xử lý trong khung giờ làm việc.</small></div>
            </div>
            <FrameNumberLeadForm />
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="cau-hoi">
          <div className={styles.narrowInner}>
            <div className={styles.sectionIntro}><span className={styles.eyebrow}>Câu hỏi thường gặp</span><h2>Thông tin cần biết trước khi đặt lịch</h2></div>
            <div className={styles.faqList}>
              {faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div><strong>Saigon Motor</strong><p>Nhánh dịch vụ của Công ty TNHH Ô tô Xe máy 368</p></div>
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
