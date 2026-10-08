import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactWidgets from "@/components/ContactWidgets";
import { localBusinessSchema, serializeJsonLd, websiteSchema } from "@/lib/seo";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <ContactWidgets />
      <Footer />
      <script
        id="sgm-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessSchema) }}
      />
      <script
        id="sgm-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
      />
    </>
  );
}
