"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Head from "next/head";

export default function PhapLyCamKetPage() {
  return (
    <>
      <Head>
        <title>Pháp Lý & Cam Kết | Saigon Motor</title>
        <meta name="description" content="Hồ sơ pháp lý và cam kết chất lượng dịch vụ của Saigon Motor (Công ty TNHH Oto Xe Máy 368)." />
      </Head>
      
      <main className="bg-sand min-h-screen pt-32 pb-16" style={{ fontFamily: 'var(--font-lora)' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-red)', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase' }}>
              Pháp Lý & Cam Kết
            </h1>
            <p className="text-gray-700" style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
              Sài Gòn Motor tự hào là doanh nghiệp hoạt động minh bạch, tuân thủ pháp luật, 
              mang lại sự an tâm tuyệt đối cho khách hàng.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white shadow-xl rounded-lg p-8 mb-12"
            style={{ borderTop: '4px solid var(--brand-red)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-teal)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚖️</span> Hồ Sơ Pháp Lý
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
              <div>
                <p><strong>Tên công ty:</strong><br/><span style={{ color: 'var(--brand-red)', fontWeight: 700, textTransform: 'uppercase' }}>Công ty TNHH Oto Xe Máy 368</span></p>
              </div>
              <div>
                <p><strong>Mã số doanh nghiệp (MST):</strong><br/><span className="font-semibold">0316339254</span></p>
              </div>
              <div>
                <p><strong>Cơ quan cấp:</strong><br/>Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh</p>
              </div>
              <div>
                <p><strong>Ngày cấp:</strong><br/>22/06/2020</p>
              </div>
              <div className="md:col-span-2">
                <p><strong>Người đại diện theo pháp luật:</strong><br/>Ông <span className="font-semibold text-lg" style={{ color: 'var(--brand-teal)' }}>Lương Thế Bằng</span> (Giám đốc)</p>
              </div>
              <div className="md:col-span-2">
                <p><strong>Địa chỉ trụ sở chính:</strong><br/>745 Phạm Văn Đồng, khu phố 8, Phường Linh Đông, Thành phố Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam</p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 italic">
              * Khách hàng có thể tra cứu thông tin hợp pháp của công ty trên Cổng thông tin quốc gia về đăng ký doanh nghiệp.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white shadow-xl rounded-lg p-8"
            style={{ borderTop: '4px solid var(--brand-yellow)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-teal)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🤝</span> 5 Cam Kết Vàng Với Khách Hàng
            </h2>
            
            <ul className="space-y-6 text-gray-800">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#fce8e8', color: 'var(--brand-red)' }}>1</div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-red)' }}>Bảo mật thông tin tuyệt đối</h3>
                  <p>Mọi giấy tờ, hồ sơ cá nhân và thông tin xe của khách hàng được cam kết bảo mật 100%, chỉ sử dụng cho mục đích làm thủ tục.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#fce8e8', color: 'var(--brand-red)' }}>2</div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-red)' }}>Minh bạch chi phí - Không phát sinh</h3>
                  <p>Báo giá rõ ràng, có hợp đồng/biên nhận từ công ty. Tuyệt đối không vẽ thêm phí, không phát sinh trong suốt quá trình xử lý hồ sơ.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#fce8e8', color: 'var(--brand-red)' }}>3</div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-red)' }}>Tuân thủ 100% Pháp luật</h3>
                  <p>Mọi thủ tục đều được thực hiện hợp pháp, chính ngạch tại cơ quan Công an và các cơ quan nhà nước có thẩm quyền.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#fce8e8', color: 'var(--brand-red)' }}>4</div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-red)' }}>Chịu trách nhiệm đến cùng</h3>
                  <p>Công ty cam kết đồng hành và chịu hoàn toàn trách nhiệm đối với hồ sơ pháp lý do công ty thực hiện (Hoàn tiền nếu lỗi do công ty).</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: '#fce8e8', color: 'var(--brand-red)' }}>5</div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-red)' }}>Nhanh chóng & Tiện lợi</h3>
                  <p>Tối ưu thời gian chờ đợi cho khách hàng, hỗ trợ giao nhận hồ sơ tận nơi theo yêu cầu.</p>
                </div>
              </li>
            </ul>

            <div className="mt-10 text-center">
              <Link href="/#tu-van" className="btn btn-teal inline-block" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: '4px', textDecoration: 'none', color: '#fff' }}>
                Nhận Báo Giá Ngay
              </Link>
            </div>
          </motion.div>

        </div>
      </main>
    </>
  );
}
