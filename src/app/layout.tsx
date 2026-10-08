import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";
import { defaultDescription, OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({ variable: "--font-be-vietnam", subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700", "800", "900"], display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Saigon Motor | Dịch vụ hồ sơ xe", template: "%s | Saigon Motor" },
  description: defaultDescription,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Dịch vụ hồ sơ xe",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Dịch vụ hồ sơ xe | Saigon Motor",
    description: defaultDescription,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Saigon Motor - Dịch vụ hồ sơ xe" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dịch vụ hồ sơ xe | Saigon Motor",
    description: defaultDescription,
    images: [OG_IMAGE],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false, email: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b3132",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  return <html lang="vi" className={beVietnam.variable}><body>
    <Script id="consent-default" strategy="beforeInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}</Script>
    {gtmId ? <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</Script> : null}
    {children}<CookieConsent />
  </body></html>;
}
