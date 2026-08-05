import Image from "next/image";
import Link from "next/link";

export default function PhatNguoiPage() {
  return (
    <main style={{ paddingTop: '100px', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ color: 'var(--brand-red)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
            Cẩm Nang Pháp Lý Hồ Sơ Xe
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--brand-teal)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            Hướng dẫn Kiểm Tra và Xử Lý Phạt Nguội 
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, fontStyle: 'italic' }}>
            Cách tra cứu lỗi vi phạm qua camera và quy trình đóng phạt, xóa lỗi trên hệ thống nhanh chóng.
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '3rem', border: '8px solid white', boxShadow: 'var(--shadow-hard)' }}>
          <Image src="/phat_nguoi_camera.png" alt="Kiểm tra phạt nguội" fill style={{ objectFit: 'cover' }} priority />
        </div>

        <article style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            1. Phạt nguội là gì?
          </h2>
          <p>
            Phạt nguội là hình thức xử lý vi phạm giao thông đường bộ thông qua hệ thống camera giám sát lắp đặt trên các tuyến đường, thay vì bị CSGT dừng xe xử lý trực tiếp (phạt nóng). Thông báo phạt sẽ được gửi về địa chỉ cư trú của chủ xe đăng ký.
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            2. Cách tra cứu phạt nguội chuẩn nhất
          </h2>
          <p>
            Để biết xe mình có dính phạt nguội hay không, chủ xe có thể thực hiện theo các cách sau:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li><strong>Cách 1:</strong> Tra cứu trên trang web của Cục CSGT (csgt.vn). Điền biển số, loại phương tiện và mã bảo mật để xem kết quả.</li>
            <li><strong>Cách 2:</strong> Tra cứu trên trang web của Cục Đăng kiểm Việt Nam. Phương pháp này rất hữu ích trước khi bạn đi đăng kiểm xe.</li>
            <li><strong>Cách 3:</strong> Cài đặt và sử dụng ứng dụng Tra cứu phạt nguội toàn quốc trên điện thoại.</li>
          </ul>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            3. Hướng dẫn đóng phạt và xóa lỗi
          </h2>
          <p>
            Khi nhận được thông báo phạt nguội, bạn cần:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li>Mang Thông báo phạt nguội, Giấy tờ xe, CCCD đến đơn vị CSGT ra quyết định xử phạt (hoặc CSGT nơi cư trú theo luật mới) để lập biên bản.</li>
            <li>Đóng tiền phạt tại kho bạc hoặc qua Cổng Dịch vụ công Quốc gia.</li>
            <li>Sau khi hoàn thành nghĩa vụ tài chính, hệ thống sẽ xóa cảnh báo để bạn có thể sang tên hoặc đăng kiểm bình thường.</li>
          </ul>
          
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', border: '1px solid var(--brand-teal)', marginTop: '2rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--brand-red)', marginBottom: '1.5rem' }}>
              Xe bị phạt nguội không thể sang tên hoặc đăng kiểm!
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              SGM cung cấp dịch vụ tra cứu lỗi phạt nguội chính xác và hỗ trợ tư vấn quy trình giải quyết phạt nguội nhanh chóng, giúp bạn an tâm trước khi giao dịch mua bán xe.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/#tu-van" className="btn btn-teal">Liên hệ Hỗ trợ Ngay &rarr;</Link>
            </div>
          </div>

        </article>
      </div>
    </main>
  );
}
