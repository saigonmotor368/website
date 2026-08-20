import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thủ tục Cấp đổi Giấy tờ, Biển số xe bị mất | Saigon Motor",
  description: "Hướng dẫn xin cấp lại Cavet xe, đổi biển số xe bị mờ, hỏng, gãy. Quy trình xử lý hồ sơ nhanh, không cần chờ đợi lâu.",
};

export default function CapDoiGiayToPage() {
  return (
    <main style={{ paddingTop: '100px', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ color: 'var(--brand-red)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
            Cẩm Nang Xử Lý Sự Cố
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--brand-teal)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            Thủ tục Cấp đổi Giấy tờ, Biển số xe bị mất, hỏng
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, fontStyle: 'italic' }}>
            Không may đánh rơi ví mất Cavet xe? Biển số bị móp méo sau va chạm? Đọc ngay bài viết này để biết cách phục hồi lại giấy tờ hợp pháp.
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '3rem', border: '8px solid white', boxShadow: 'var(--shadow-hard)' }}>
          <Image src="/vintage_lost_papers.png" alt="Cấp lại giấy tờ xe bị mất" fill style={{ objectFit: 'cover' }} priority />
        </div>

        <article style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          
          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            1. Các trường hợp được Cấp đổi, Cấp lại
          </h2>
          <p>Theo Thông tư 37/2026/TT-BCA và các quy định hiện hành, cơ quan công an sẽ xem xét cấp đổi, cấp lại trong các trường hợp sau:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li><strong>Giấy đăng ký xe (Cavet):</strong> Bị mất, bị rách nát, mờ chữ, hoặc thay đổi thông tin chủ xe (đổi tên, đổi địa chỉ).</li>
            <li><strong>Biển số xe:</strong> Bị rơi mất, bị mờ, gãy, hỏng, hoặc chủ xe có nhu cầu đổi từ biển vuông sang biển dài, biển trắng sang biển vàng (kinh doanh vận tải).</li>
          </ul>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            2. Hồ sơ cần chuẩn bị
          </h2>
          <p>Quá trình xin cấp lại đòi hỏi sự cẩn thận trong việc khai báo. Bạn cần chuẩn bị:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li><strong>Giấy khai đăng ký xe:</strong> Khai báo rõ lý do xin cấp lại (mất, hỏng...).</li>
            <li><strong>Giấy tờ của chủ xe:</strong> Căn cước công dân (CCCD) gắn chip.</li>
            <li>Trường hợp cấp đổi do hỏng/rách, phải nộp lại Giấy chứng nhận đăng ký xe hoặc Biển số xe cũ đang hỏng.</li>
            <li>Trường hợp xe cải tạo, thay đổi màu sơn, cần có thêm chứng từ cải tạo, thay đổi.</li>
          </ul>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            3. Dự kiến Thời gian và Chi phí
          </h2>
          <p>
            Lệ phí cấp lại giấy đăng ký xe hoặc biển số thường dao động từ vài chục đến vài trăm ngàn đồng theo quy định của Bộ Tài chính. 
            Thời gian giải quyết cấp lại giấy đăng ký xe bị mất không quá 30 ngày (để cơ quan chức năng xác minh hồ sơ, đăng báo tìm kiếm).
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            4. Tiết kiệm thời gian 30 ngày xác minh
          </h2>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', border: '1px solid var(--brand-teal)', marginTop: '2rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Thay vì tự đi làm và chờ đợi quá trình xác minh 30 ngày, việc ủy quyền cho một đơn vị am hiểu luật pháp như SGM sẽ giúp quy trình diễn ra trơn tru và nhanh chóng hơn rất nhiều.
            </p>
            <p style={{ fontWeight: 700, color: 'var(--brand-red)', marginBottom: '1.5rem' }}>
              Chúng tôi nhận hỗ trợ cấp lại Cavet, cấp đổi Biển số siêu tốc. Xử lý triệt để các rắc rối giấy tờ để bạn sớm có xe lưu thông an toàn.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/#tu-van" className="btn btn-teal">Gửi Yêu Cầu Cấp Lại Giấy Tờ &rarr;</Link>
            </div>
          </div>

        </article>
      </div>
    </main>
  );
}
