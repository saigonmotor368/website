import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hướng dẫn Thu hồi Đăng ký & Biển số xe (Rút gốc) | Saigon Motor",
  description: "Thủ tục thu hồi giấy đăng ký, biển số xe theo quy định biển số định danh mới nhất. Dịch vụ rút hồ sơ gốc nhanh chóng.",
};

export default function ThuHoiDangKyPage() {
  return (
    <main style={{ paddingTop: '100px', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ color: 'var(--brand-red)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
            Cập nhật Thông tư 79/2024/TT-BCA
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--brand-teal)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            Hướng dẫn Thu hồi Đăng ký & Biển số xe (Rút hồ sơ gốc)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, fontStyle: 'italic' }}>
            "Xe đi, Biển ở lại" - Nắm vững quy định về định danh biển số để không bị phạt và bảo vệ quyền lợi pháp lý của bản thân khi bán xe.
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '3rem', border: '8px solid white', boxShadow: 'var(--shadow-hard)' }}>
          <Image src="/vintage_license_plate.png" alt="Thu hồi biển số định danh Sài Gòn" fill style={{ objectFit: 'cover' }} priority />
        </div>

        <article style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          <div style={{ backgroundColor: '#fff3cd', borderLeft: '5px solid #ffecb5', padding: '1.5rem', marginBottom: '2rem', color: '#856404' }}>
            <strong>Lưu ý thuật ngữ:</strong> Theo quy định mới từ Bộ Công An, thủ tục mà người dân thường gọi là "Rút hồ sơ gốc" nay được gọi chính thức là <strong>"Thủ tục thu hồi giấy chứng nhận đăng ký và biển số xe"</strong>.
          </div>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            1. Tại sao phải làm thủ tục Thu hồi?
          </h2>
          <p>
            Theo Thông tư 79/2024/TT-BCA (và trước đó là Thông tư 24/2023), biển số xe đã được quản lý theo mã định danh của chủ xe. Khi bán, tặng cho, thừa kế xe, chủ xe <strong>bắt buộc phải giữ lại biển số và giấy đăng ký xe</strong> để nộp lại cho cơ quan Công an làm thủ tục thu hồi.
          </p>
          <p style={{ color: 'var(--brand-red)', fontWeight: 'bold' }}>
            Nếu quá 30 ngày kể từ ngày làm giấy tờ chuyển quyền sở hữu mà không làm thủ tục thu hồi, chủ xe sẽ bị phạt hành chính và phải chịu trách nhiệm trước pháp luật về các vi phạm giao thông liên quan đến chiếc xe đó.
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            2. Hồ sơ chuẩn bị Thu hồi
          </h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li>Giấy khai thu hồi đăng ký, biển số xe (theo mẫu).</li>
            <li>Giấy tờ của chủ xe (CCCD gắn chip).</li>
            <li>2 bản chà số khung, số máy.</li>
            <li>Chứng nhận đăng ký xe (bản gốc).</li>
            <li>Biển số xe (Tháo cả 2 biển trước sau đối với ô tô).</li>
            <li>Bản sao chứng từ chuyển quyền sở hữu (Hợp đồng mua bán).</li>
          </ul>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            3. Xe Vắng Chủ - Nỗi ám ảnh của người mua xe cũ
          </h2>
          <p>
            Mua xe qua nhiều đời chủ, giờ không tìm thấy chủ cũ để rút hồ sơ thu hồi biển số? Đừng lo lắng! Theo quy định hiện hành, cơ quan công an có cơ chế giải quyết cho các trường hợp xe chuyển quyền sở hữu qua nhiều tổ chức, cá nhân. Tuy nhiên, thủ tục này đòi hỏi bạn phải am hiểu luật, chuẩn bị hồ sơ cam kết và thời gian xác minh có thể kéo dài 30 ngày.
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            4. Trút bỏ gánh nặng thủ tục cùng SGM
          </h2>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', border: '1px solid var(--brand-teal)', marginTop: '2rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Việc tự tháo biển số, chà số khung số máy và chầu chực tại cơ quan công an để làm thủ tục thu hồi tốn rất nhiều mồ hôi và công sức. Đặc biệt là các ca "xe vắng chủ", sai lệch số khung.
            </p>
            <p style={{ fontWeight: 700, color: 'var(--brand-red)', marginBottom: '1.5rem' }}>
              SGM cung cấp dịch vụ xử lý thu hồi đăng ký, rút hồ sơ trọn gói siêu tốc. Cam kết hợp pháp, giải quyết dứt điểm các ca khó, xe vắng chủ.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/#tu-van" className="btn btn-teal">Gửi Yêu Cầu Hỗ Trợ &rarr;</Link>
            </div>
          </div>

        </article>
      </div>
    </main>
  );
}
