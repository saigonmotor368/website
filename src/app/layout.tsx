import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({ variable: "--font-be-vietnam", subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700", "800", "900"], display: "swap" });
const siteUrl = "https://saigonmotor.vn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Saigon Motor | Dịch vụ hồ sơ xe", template: "%s | Saigon Motor" },
  description: "Saigon Motor hỗ trợ thủ tục sang tên, thu hồi đăng ký và biển số ô tô, xe máy tại TP.HCM và các tỉnh.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "vi_VN", url: siteUrl, siteName: "Saigon Motor", images: [{ url: "/logo_sgm.png", width: 512, height: 512, alt: "Saigon Motor" }] },
  robots: { index: true, follow: true },
};

const localBusiness = {
  "@context": "https://schema.org", "@type": "LocalBusiness", name: "Saigon Motor - Công ty TNHH Ô tô Xe máy 368",
  image: `${siteUrl}/logo_sgm.png`, "@id": siteUrl, url: siteUrl, telephone: "+84704104104", email: "saigommotor68@gmail.com", priceRange: "₫₫",
  areaServed: ["TP. Hồ Chí Minh", "Việt Nam"],
  address: { "@type": "PostalAddress", streetAddress: "745 Phạm Văn Đồng, Khu phố 8, phường Hiệp Bình", addressLocality: "TP. Hồ Chí Minh", postalCode: "700000", addressCountry: "VN" },
  geo: { "@type": "GeoCoordinates", latitude: 10.8437212, longitude: 106.7448224 },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  return <html lang="vi" className={beVietnam.variable}><body>
    <Script id="consent-default" strategy="beforeInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}</Script>
    {gtmId ? <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script> : null}
    {children}<CookieConsent />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g,"\\u003c") }} />
  </body></html>;
}
