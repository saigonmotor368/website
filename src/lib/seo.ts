export const SITE_URL = "https://saigonmotor.vn";
export const SITE_NAME = "Saigon Motor";
export const LEGAL_NAME = "Công ty TNHH Ô tô Xe máy 368";
export const OG_IMAGE = `${SITE_URL}/og-saigon-motor.jpg`;

export const defaultDescription =
  "Saigon Motor hỗ trợ sang tên xe, thu hồi đăng ký và biển số ô tô, xe máy tại TP.HCM và các tỉnh. Kiểm tra hồ sơ, báo phí rõ ràng.";

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#business`,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  alternateName: "SGM",
  description: defaultDescription,
  url: SITE_URL,
  logo: `${SITE_URL}/logo_sgm.png`,
  image: OG_IMAGE,
  telephone: "+84704104104",
  email: "saigonmotor68@gmail.com",
  taxID: "0316339254",
  priceRange: "₫₫",
  areaServed: [
    { "@type": "City", name: "TP. Hồ Chí Minh" },
    { "@type": "Country", name: "Việt Nam" },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "745 Phạm Văn Đồng, Khu phố 8, phường Hiệp Bình",
    addressLocality: "TP. Hồ Chí Minh",
    postalCode: "700000",
    addressCountry: "VN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 10.8437212,
    longitude: 106.7448224,
  },
  hasMap: "https://maps.google.com/?q=10.8437212,106.7448224",
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: "SGM",
  inLanguage: "vi-VN",
  publisher: { "@id": `${SITE_URL}/#business` },
};

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
