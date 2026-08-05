import Link from "next/link";
import Image from "next/image";

export default function ThankYouPage() {
  return (
    <main style={{ paddingTop: '100px', backgroundColor: 'var(--bg-primary)', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{ backgroundColor: '#F4F1EA', padding: '4rem 2rem', borderRadius: '8px', border: '2px solid var(--brand-teal)', boxShadow: '15px 15px 0px rgba(61, 56, 49, 1)' }}>
          
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem auto' }}>
             <Image src="/logo_sgm.png" alt="SGM Logo" fill style={{ objectFit: 'contain' }} />
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--brand-teal)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            Cảm Ơn Bạn Hữu!
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Hệ thống đã ghi nhận yêu cầu tư vấn thành công. Chuyên viên của <strong>SGM</strong> sẽ nhấc máy gọi điện lại cho bạn trong ít phút tới để hỗ trợ tận tình.
          </p>

          <Link href="/" className="btn btn-teal" style={{ display: 'inline-block', padding: '1rem 3rem', fontSize: '1.2rem' }}>
            &larr; Quay lại Trang Chủ
          </Link>
        </div>

      </div>
    </main>
  );
}
