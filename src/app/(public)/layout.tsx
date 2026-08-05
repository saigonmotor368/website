import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactWidgets from "@/components/ContactWidgets";

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
    </>
  );
}
