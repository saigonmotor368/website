import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import TrackedAnchor from "@/components/TrackedAnchor";
import { OG_IMAGE, serializeJsonLd, SITE_URL } from "@/lib/seo";
import PhatNguoiLeadForm from "./PhatNguoiLeadForm";
import styles from "../tu-van-ho-so-xe/page.module.css";

const PAGE_PATH = "/tra-cuu-xu-ly-phat-nguoi-tphcm";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const GOOGLE_ADS_ID = "AW-18352281213";
const OFFICIAL_LOOKUP_URL = "https://www.csgt.vn/tra-cuu-phuong-tien-vi-pham.html";
const title = "Hỗ trợ kiểm tra và xử lý phạt nguội tại TP.HCM";
const description = "Saigon Motor kiểm tra thông tin phạt nguội ô tô, xe máy từ nguồn chính thức, chỉ rõ nơi xử lý, giấy tờ cần chuẩn bị và báo phí trước khi tiếp nhận.";

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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Saigon Motor hỗ trợ kiểm tra và xử lý phạt nguội" }],
  },
};

const trackingData = { service_slug: "xu-ly-phat-nguoi", service_group: "violations", page_path: PAGE_PATH };

const faqs = [
  {
    question: "Tra cứu không thấy lỗi có nghĩa là xe chắc chắn không vi phạm?",
    answer: "Chưa hẳn. Dữ liệu vi phạm có thể được cập nhật dần trong quá trình cơ quan chức năng xác minh, vì vậy quý khách không nên chỉ dựa vào một nguồn hay một lần tra cứu. SGM sẽ đối chiếu thêm với thông báo quý khách nhận được và hướng dẫn cách theo dõi tiếp.",
  },
  {
    question: "SGM có xoá hoặc giảm mức phạt được không?",
    answer: "Không. SGM chỉ hỗ trợ kiểm tra thông tin, chuẩn bị giấy tờ và hướng dẫn quý khách xử lý đúng nơi, đúng trình tự. Việc xác minh, ra quyết định xử phạt và cập nhật kết quả thuộc thẩm quyền của cơ quan nhà nước.",
  },
  {
    question: "Xe đã bán nhưng vẫn phát sinh phạt nguội thì phải làm sao?",
    answer: "Chúng tôi sẽ xem xét thời điểm bàn giao xe, giấy tờ mua bán và tình trạng đăng ký hiện tại của xe, từ đó giải thích rõ những việc quý khách cần làm để làm rõ trách nhiệm với từng lỗi vi phạm.",
  },
  {
    question: "Chi phí hỗ trợ được tính như thế nào?",
    answer: "Việc kiểm tra ban đầu giúp SGM nắm được số vụ việc, nơi đang xử lý và phần việc quý khách cần hỗ trợ. Sau bước này, chúng tôi báo phí cụ thể và chỉ tiếp nhận khi quý khách đồng ý. Tiền nộp phạt theo quyết định của cơ quan nhà nước được tách riêng với phí dịch vụ.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Hỗ trợ kiểm tra và xử lý phạt nguội",
    description,
    url: PAGE_URL,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: { "@type": "City", name: "TP. Hồ Chí Minh" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  },
];

export default function PhatNguoiPage() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <div className={styles.page}>
      <Script id="phat-nguoi-google-ads-library" src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="phat-nguoi-google-ads-config" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`}</Script>
      {gtmId ? <Script id="phat-nguoi-gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script> : null}
      {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />)}

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href={PAGE_PATH} aria-label="Saigon Motor - Hỗ trợ xử lý phạt nguội">
            <Image src="/logo_sgm.png" width={54} height={54} alt="Saigon Motor" priority />
            <span><strong>SAIGON <em>MOTOR</em></strong><small>Công ty TNHH Ô tô Xe máy 368</small></span>
          </Link>
          <nav aria-label="Nội dung trang phạt nguội"><a href="#truong-hop">Trường hợp thường gặp</a><a href="#quy-trinh">Quy trình hỗ trợ</a><a href="#cau-hoi">Câu hỏi thường gặp</a></nav>
          <TrackedAnchor className={styles.headerCall} href="tel:0704104104" eventName="call_click" placement="phat_nguoi_header" eventData={trackingData}>Gọi 0704 104 104</TrackedAnchor>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Phạt nguội ô tô, xe máy tại TP.HCM</span>
              <h1>Nhận thông báo phạt nguội? Chúng tôi giúp quý khách kiểm tra rõ ràng, xử lý đúng nơi</h1>
              <p className={styles.heroLead}>Saigon Motor đối chiếu thông tin vi phạm từ nguồn chính thức, chỉ rõ lỗi được ghi nhận ở đâu, đang do cơ quan nào xử lý và quý khách cần chuẩn bị những giấy tờ gì. Chi phí hỗ trợ được báo trước, để quý khách an tâm quyết định.</p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#dang-ky">Gửi biển số để kiểm tra</a>
                <TrackedAnchor className={styles.secondaryButton} href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" eventName="zalo_click" placement="phat_nguoi_hero" eventData={trackingData}>Nhắn Zalo cho SGM</TrackedAnchor>
              </div>
              <div className={styles.privateNotice}><strong>Xin quý khách lưu ý</strong><p>Saigon Motor là đơn vị dịch vụ tư nhân, không phải cơ quan nhà nước. Chúng tôi không quyết định mức phạt; việc này thuộc thẩm quyền của cơ quan nhà nước. Quý khách vẫn có thể tự tra cứu tại <a href={OFFICIAL_LOOKUP_URL} target="_blank" rel="noopener noreferrer">trang tra cứu của Cục Cảnh sát giao thông</a>.</p></div>
            </div>
            <div className={styles.reviewCard} aria-label="Những việc SGM hỗ trợ quý khách">
              <div className={styles.reviewTop}><span>SGM hỗ trợ quý khách</span><strong>Báo phí trước khi tiếp nhận</strong></div>
              <ol>
                <li><span>01</span><div><strong>Kiểm tra thông tin vi phạm</strong><p>Tra cứu từ nguồn chính thức và đối chiếu với thông báo quý khách nhận được.</p></div></li>
                <li><span>02</span><div><strong>Xác định nơi xử lý</strong><p>Chỉ rõ lỗi do cơ quan nào thụ lý và quý khách cần liên hệ ở đâu.</p></div></li>
                <li><span>03</span><div><strong>Chuẩn bị giấy tờ</strong><p>Hướng dẫn giấy tờ của chủ xe, người điều khiển và giấy tờ xe theo từng vụ việc.</p></div></li>
                <li><span>04</span><div><strong>Theo dõi phần việc đã nhận</strong><p>Cập nhật tiến độ cho quý khách đến khi hoàn tất phần việc hai bên đã thống nhất.</p></div></li>
              </ol>
              <div className={styles.reviewFoot}>Tiền nộp phạt theo quyết định của cơ quan nhà nước được tách riêng với phí dịch vụ</div>
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="Cam kết khi hỗ trợ phạt nguội"><div><span>Tra cứu từ <strong>nguồn chính thức</strong></span><span><strong>Báo phí rõ ràng</strong> trước khi làm</span><span>Phục vụ <strong>ô tô, xe máy</strong> tại TP.HCM</span></div></section>

        <section className={styles.section} id="truong-hop">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}><span className={styles.eyebrow}>Trường hợp thường gặp</span><h2>Mỗi thông báo vi phạm đều cần được kiểm tra cẩn thận trước khi xử lý</h2><p>Phạt nguội là cách gọi quen thuộc của những lỗi vi phạm được ghi nhận qua camera và thiết bị kỹ thuật. Thông tin đôi khi đến chậm, khiến chủ xe lúng túng không biết bắt đầu từ đâu.</p></div>
            <div className={styles.caseGrid}>
              <article><span>01</span><h3>Nhận thông báo vi phạm qua hình ảnh</h3><p>SGM kiểm tra lỗi được ghi nhận ở đâu, vào thời điểm nào và hiện đã được xử lý đến bước nào.</p></article>
              <article><span>02</span><h3>Thông tin vi phạm chưa khớp với xe</h3><p>Chúng tôi đối chiếu biển số, đặc điểm phương tiện và thời điểm sử dụng xe để chỉ ra những điểm cần làm rõ.</p></article>
              <article><span>03</span><h3>Xe đã bán nhưng vẫn phát sinh lỗi</h3><p>SGM xem xét thời điểm bàn giao và giấy tờ mua bán, giải thích những việc quý khách cần làm với từng lỗi.</p></article>
              <article><span>04</span><h3>Cần xử lý trước khi đăng kiểm hoặc mua bán</h3><p>Chúng tôi giúp quý khách nắm rõ các lỗi còn tồn đọng để chủ động sắp xếp thời gian xử lý kịp lúc.</p></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="quy-trinh">
          <div className={styles.sectionInner}>
            <div className={styles.sectionIntro}><span className={styles.eyebrow}>Quy trình hỗ trợ</span><h2>Từng bước rõ ràng, để quý khách luôn nắm được hồ sơ đang ở đâu</h2></div>
            <div className={styles.processGrid}>
              <div><span>1</span><h3>Tiếp nhận thông tin</h3><p>SGM ghi nhận biển số, loại xe và thông báo vi phạm quý khách đang có.</p></div>
              <div><span>2</span><h3>Kiểm tra hồ sơ</h3><p>Chúng tôi tra cứu từ nguồn chính thức, xác định số vụ việc và nơi đang thụ lý.</p></div>
              <div><span>3</span><h3>Báo phí rõ ràng</h3><p>Quý khách được giải thích từng bước và biết trước chi phí hỗ trợ trước khi đồng ý.</p></div>
              <div><span>4</span><h3>Thực hiện và bàn giao kết quả</h3><p>SGM thực hiện đúng phần việc đã thống nhất, cập nhật tiến độ và bàn giao giấy tờ cho quý khách.</p></div>
            </div>
            <p className={styles.legalNote}>SGM không quyết định mức phạt và không can thiệp vào kết quả xử lý. Việc xác minh, ra quyết định xử phạt và cập nhật kết quả thuộc thẩm quyền của cơ quan nhà nước.</p>
          </div>
        </section>

        <section className={styles.section} id="dang-ky">
          <div className={`${styles.sectionInner} ${styles.formLayout}`}>
            <div className={styles.formSide}><span className={styles.eyebrow}>Kiểm tra phạt nguội</span><h2>Chỉ cần biển số, chúng tôi sẽ giúp quý khách nắm rõ tình trạng của xe</h2><p>Quý khách chưa cần gửi giấy tờ trên website. Sau khi nhận yêu cầu, SGM sẽ liên hệ, trao đổi kết quả kiểm tra và chỉ tiếp nhận khi quý khách đồng ý với phạm vi và chi phí.</p><div className={styles.contactCard}><span>Hotline/Zalo</span><strong>0704 104 104</strong><small>Hotline nhận cuộc gọi 24/7. Yêu cầu gửi qua form sẽ được SGM phản hồi trong giờ làm việc.</small></div></div>
            <PhatNguoiLeadForm />
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`} id="cau-hoi"><div className={styles.narrowInner}><div className={styles.sectionIntro}><span className={styles.eyebrow}>Câu hỏi thường gặp</span><h2>Những điều quý khách thường quan tâm về phạt nguội</h2></div><div className={styles.faqList}>{faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>
      </main>

      <footer className={styles.footer}><div className={styles.footerInner}><div><strong>Saigon Motor</strong><p>Đơn vị dịch vụ tư nhân thuộc Công ty TNHH Ô tô Xe máy 368, không phải cơ quan nhà nước</p></div><div><span>MST 0316339254</span><span>745 Phạm Văn Đồng, Khu phố 8, phường Hiệp Bình, TP. Hồ Chí Minh</span></div><div><Link href="/phap-ly-cam-ket">Thông tin pháp lý</Link><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link></div></div></footer>
      <div className={styles.mobileRail} aria-label="Liên hệ nhanh"><TrackedAnchor href="tel:0704104104" eventName="call_click" placement="phat_nguoi_sticky" eventData={trackingData}>Gọi SGM</TrackedAnchor><TrackedAnchor href="https://zalo.me/0704104104" target="_blank" rel="noopener noreferrer" eventName="zalo_click" placement="phat_nguoi_sticky" eventData={trackingData}>Nhắn Zalo</TrackedAnchor></div>
    </div>
  );
}
