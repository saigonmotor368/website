import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đổi Biển Số Vàng Cho Xe Kinh Doanh | Saigon Motor",
  description: "Thủ tục và chi phí cấp đổi biển số vàng cho xe kinh doanh vận tải (Grab, Be, Taxi) và cách rút hồ sơ trả lại biển trắng.",
};

export default function DoiBienSoVangPage() {
  return (
    <main style={{ paddingTop: '100px', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ color: 'var(--brand-red)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
            Cẩm Nang Pháp Lý Hồ Sơ Xe
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--brand-teal)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            Đổi Biển Số Vàng Cho Xe Kinh Doanh
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, fontStyle: 'italic' }}>
            Những lưu ý quan trọng khi cấp đổi biển số vàng cho xe kinh doanh vận tải và thủ tục rút hồ sơ trả lại biển trắng.
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '3rem', border: '8px solid white', boxShadow: 'var(--shadow-hard)' }}>
          <Image src="/bien_so_vang.png" alt="Đổi biển số vàng" fill style={{ objectFit: 'cover' }} priority />
        </div>

        <article style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            1. Bắt buộc xe kinh doanh phải có Biển Số Vàng
          </h2>
          <p>
            Theo quy định của Thông tư 58 và mới nhất là Thông tư 24/2023/TT-BCA, tất cả các phương tiện hoạt động kinh doanh vận tải (bao gồm cả taxi công nghệ như Grab, Be, xe tải chở hàng, xe khách) đều <strong>bắt buộc phải gắn biển số nền màu vàng, chữ và số màu đen</strong>.
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            2. Thủ tục Cấp đổi Biển số Vàng
          </h2>
          <p>
            Chủ xe cá nhân hoặc doanh nghiệp cần chuẩn bị các giấy tờ sau mang tới Phòng CSGT:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li>Giấy khai đăng ký xe.</li>
            <li>CCCD của chủ xe (hoặc giấy giới thiệu nếu là xe công ty).</li>
            <li>Giấy chứng nhận đăng ký xe (Cavet) gốc.</li>
            <li>Hai biển số cũ (biển nền trắng). Biển số cũ sẽ được nộp lại khi nhận biển vàng mới.</li>
          </ul>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            3. Thủ tục Đổi lại Biển Trắng khi ngưng kinh doanh
          </h2>
          <p>
            Khi không còn nhu cầu kinh doanh vận tải, hoặc khi muốn bán xe cho người khác sử dụng với mục đích cá nhân, bạn phải làm thủ tục chuyển lại thành Biển Trắng. Việc này đặc biệt quan trọng để xe không bị áp khung niên hạn sử dụng hoặc đóng phí đường bộ giá cao.
          </p>
          <p>
            Thủ tục khá tương đồng: nộp lại biển vàng, cavet và khai báo chuyển mục đích sử dụng sang xe không kinh doanh. Cơ quan Công an sẽ cấp lại biển trắng định danh.
          </p>
          
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', border: '1px solid var(--brand-teal)', marginTop: '2rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--brand-red)', marginBottom: '1.5rem' }}>
              Tiết kiệm thời gian cấp đổi biển với SGM!
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Việc làm thủ tục thay đổi từ biển trắng sang biển vàng (hoặc ngược lại) đòi hỏi sự chờ đợi tại cơ quan chức năng. Dịch vụ của SGM sẽ lo liệu trọn gói, lấy biển số nhanh chóng mà không làm gián đoạn công việc kinh doanh của bạn.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/#tu-van" className="btn btn-teal">Liên hệ Dịch Vụ Cấp Biển Ngay &rarr;</Link>
            </div>
          </div>

        </article>
      </div>
    </main>
  );
}
