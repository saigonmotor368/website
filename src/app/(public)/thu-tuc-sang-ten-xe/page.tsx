import Image from "next/image";
import Link from "next/link";

export default function SangTenXePage() {
  return (
    <main style={{ paddingTop: '100px', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ color: 'var(--brand-red)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
            Cẩm Nang Pháp Lý Cơ Giới
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--brand-teal)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            Thủ tục Sang tên Ô tô, Xe máy từ A đến Z (Cập nhật 2026)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, fontStyle: 'italic' }}>
            Quy trình pháp lý chi tiết giúp bạn chuyển nhượng chiếc xế hộp hoặc xe máy một cách suôn sẻ, an toàn, không lo vướng mắc.
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '3rem', border: '8px solid white', boxShadow: 'var(--shadow-hard)' }}>
          <Image src="/vintage_car_sale.png" alt="Sang tên mua bán xe cũ Sài Gòn" fill style={{ objectFit: 'cover' }} priority />
        </div>

        <article style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            1. Hồ sơ cần chuẩn bị (Cả Người Bán & Người Mua)
          </h2>
          <p>
            Trước khi tiến hành sang tên, cả hai bên cần chuẩn bị đầy đủ các giấy tờ pháp lý để tránh việc phải đi lại nhiều lần. Dưới đây là danh sách bắt buộc:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li><strong>Giấy tờ cá nhân:</strong> Căn cước công dân (CCCD) gắn chip của cả hai bên. Nếu bên bán có vợ/chồng thì cần CCCD của cả hai vợ chồng và giấy đăng ký kết hôn (hoặc giấy xác nhận độc thân).</li>
            <li><strong>Giấy tờ xe:</strong> Giấy chứng nhận đăng ký xe (Cavet) bản gốc.</li>
            <li>Hợp đồng mua bán, tặng cho (Sẽ được lập tại văn phòng công chứng).</li>
          </ul>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            2. Quy trình thực hiện chi tiết
          </h2>
          
          <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-red)', marginTop: '1.5rem' }}>Bước 1: Công chứng Hợp đồng Mua bán</h3>
          <p>
            Hai bên mang toàn bộ hồ sơ đã chuẩn bị đến Văn phòng Công chứng để lập và công chứng Hợp đồng mua bán. Xin lưu ý, theo luật hiện hành, việc mua bán bằng giấy viết tay không qua công chứng sẽ bị phạt khi sang tên.
          </p>

          <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-red)', marginTop: '1.5rem' }}>Bước 2: Nộp lệ phí trước bạ</h3>
          <p>
            Người mua mang Hợp đồng mua bán và Giấy tờ xe đến Chi cục Thuế nơi mình cư trú để khai và nộp lệ phí trước bạ. Đối với xe cũ, mức thu thường là 2% đối với ô tô và 1% đối với xe máy (tùy khu vực). Hiện nay có thể nộp trực tuyến qua Cổng Dịch vụ công.
          </p>

          <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-red)', marginTop: '1.5rem' }}>Bước 3: Sang tên tại cơ quan Công an</h3>
          <p>
            Nộp hồ sơ sang tên tại Phòng CSGT (nếu là ô tô) hoặc Công an cấp Huyện/Xã (nếu là xe máy). Cán bộ sẽ kiểm tra số khung, số máy và thu lại giấy đăng ký cũ để cấp giấy mới mang tên bạn. 
            <em> (Lưu ý: Biển số xe hiện nay được định danh theo chủ cũ. Vui lòng xem thêm bài viết về Thủ tục thu hồi).</em>
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            3. Bạn thấy quá rắc rối và tốn thời gian?
          </h2>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', border: '1px solid var(--brand-teal)', marginTop: '2rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Việc đi lại giữa Công chứng, Thuế và Cơ quan Công an thường mất rất nhiều thời gian (có thể kéo dài vài ngày) nếu bạn không rành thủ tục hoặc thiếu sót hồ sơ. 
              Đừng để những rắc rối hành chính làm hỏng niềm vui sở hữu xe mới!
            </p>
            <p style={{ fontWeight: 700, color: 'var(--brand-red)', marginBottom: '1.5rem' }}>
              SGM cung cấp dịch vụ Sang tên - Công chứng tại nhà trọn gói. Chúng tôi sẽ lo liệu mọi thủ tục từ A-Z, bạn chỉ cần ký tên và nhận giấy tờ tại nhà.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/#tu-van" className="btn btn-teal">Liên hệ Tư vấn Ngay &rarr;</Link>
            </div>
          </div>

        </article>
      </div>
    </main>
  );
}
