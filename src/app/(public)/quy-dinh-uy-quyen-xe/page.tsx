import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quy Định Về Giấy Ủy Quyền Mua Bán Xe | Saigon Motor",
  description: "Giải đáp pháp lý về hợp đồng ủy quyền xe: thời hạn bao lâu, có tự sang tên được không, và các rủi ro khi mua xe qua ủy quyền.",
};

export default function UyQuyenXePage() {
  return (
    <main style={{ paddingTop: '100px', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ color: 'var(--brand-red)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>
            Cẩm Nang Pháp Lý Hồ Sơ Xe
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--brand-teal)', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            Quy Định Về Giấy Ủy Quyền Mua Bán Xe
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.6, fontStyle: 'italic' }}>
            Hợp đồng ủy quyền xe có giá trị bao lâu? Có được phép làm thủ tục sang tên khi chỉ có giấy ủy quyền?
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '3rem', border: '8px solid white', boxShadow: 'var(--shadow-hard)' }}>
          <Image src="/uy_quyen_xe.png" alt="Ủy quyền xe" fill style={{ objectFit: 'cover' }} priority />
        </div>

        <article style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            1. Các loại Giấy ủy quyền xe
          </h2>
          <p>
            Trong quá trình giao dịch xe cộ, người dân thường sử dụng hợp đồng ủy quyền để thay thế cho việc sang tên nhằm tiết kiệm chi phí trước bạ hoặc tạo sự linh hoạt khi mua bán. Có 2 loại chính:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            <li><strong>Ủy quyền sử dụng:</strong> Người được ủy quyền chỉ có quyền điều khiển, sử dụng phương tiện.</li>
            <li><strong>Ủy quyền định đoạt (Ủy quyền toàn phần):</strong> Người được ủy quyền có quyền sử dụng, cho thuê, cầm cố, và làm thủ tục bán lại xe cho người thứ ba.</li>
          </ul>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            2. Thời hạn của Hợp đồng ủy quyền
          </h2>
          <p>
            Theo Bộ luật Dân sự, thời hạn ủy quyền do các bên tự thỏa thuận. Nếu không có thỏa thuận cụ thể, giấy ủy quyền thường có giá trị 1 năm. Tuy nhiên, thông thường các bên khi mua bán xe qua ủy quyền sẽ ghi thời hạn dài hơn (như 5 năm, 10 năm hoặc 20 năm). 
          </p>
          <p style={{ color: 'var(--brand-red)' }}>
            <strong>Rủi ro tiềm ẩn:</strong> Nếu người ủy quyền (người bán ban đầu) qua đời hoặc mất năng lực hành vi dân sự, Hợp đồng ủy quyền đương nhiên hết hiệu lực, dẫn đến rủi ro pháp lý lớn cho người mua.
          </p>

          <h2 style={{ fontSize: '2rem', color: 'var(--brand-teal)', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            3. Sang tên xe khi chỉ có Hợp đồng ủy quyền
          </h2>
          <p>
            Theo quy định, người được ủy quyền <strong>không thể tự sang tên xe cho chính mình</strong>. Để hợp thức hóa tài sản thành của mình, người được ủy quyền (A) bắt buộc phải bán chiếc xe đó cho một bên thứ ba (B) thông qua Hợp đồng mua bán công chứng, sau đó B mới tiến hành sang tên hợp lệ.
          </p>
          
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', border: '1px solid var(--brand-teal)', marginTop: '2rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--brand-red)', marginBottom: '1.5rem' }}>
              Tránh rủi ro khi mua xe qua Ủy quyền!
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              SGM khuyên bạn nên thực hiện việc ký kết hợp đồng mua bán và sang tên chính chủ để bảo vệ quyền lợi hợp pháp. Chúng tôi cung cấp dịch vụ hỗ trợ làm hợp đồng Mua Bán hoặc Ủy Quyền chuẩn luật nhất.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link href="/#tu-van" className="btn btn-teal">Tư vấn Lập Hợp đồng Ngay &rarr;</Link>
            </div>
          </div>

        </article>
      </div>
    </main>
  );
}
