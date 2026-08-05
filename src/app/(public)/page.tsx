"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const [formData, setFormData] = useState({ name: '', phone: '', service: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      await fetch("https://script.google.com/macros/s/AKfycbxgwtWqcBTKy5J0HrFJgUSZJiqrm4tgdQ-3yDbHdGyMSrkcz3j4gCmPK0rJpipUyDOTww/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      // Redirect to Thank You page on success
      router.push('/thank-you');
    } catch (err) {
      setFormStatus('error');
    }
  };

  // Framer motion variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <>
      <main>
        {/* HERO SECTION VINTAGE */}
        <section className="section" style={{ position: 'relative', padding: '10rem 0 6rem 0', minHeight: '90vh', display: 'flex', alignItems: 'center', backgroundColor: '#e2d9c3' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.15 }}>
            <Image src="/vintage_shop.png" alt="Vintage Saigon Shop" fill style={{ objectFit: 'cover' }} priority />
          </div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem', width: '100%', position: 'relative', zIndex: 1 }}>
            <motion.div variants={fadeUp} style={{ flex: '1 1 500px', color: 'var(--text-primary)' }}>
              <div style={{ display: 'inline-block', padding: '0.25rem 1rem', border: '1px solid var(--brand-red)', color: 'var(--brand-red)', fontSize: '1rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Tín Nghĩa Dài Lâu</div>
              <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, color: 'var(--brand-teal)' }}>
                Dịch Vụ Pháp Lý <br/><span className="text-red">Hồ Sơ Xe</span>
              </h1>
              <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '600px' }}>
                Chào người anh em mê xe! Dù là chuyển nhượng chiếc xế hộp tâm đắc hay dọn lại con "ngựa sắt" hai bánh kỷ niệm, <strong>SGM</strong> luôn ở đây. Hơn mười năm lăn lộn, chúng tôi thấu hiểu từng nỗi lo giấy tờ pháp lý của bạn. Hãy để chúng tôi lo liệu, êm ru và trọn vẹn!
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <motion.a 
                  whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(255, 0, 0, 0.4)" }} 
                  whileTap={{ scale: 0.95 }}
                  href="tel:0704104104" 
                  className="btn btn-primary" 
                  style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
                >
                  ☎ Gọi Ngay: 0704.104.104
                </motion.a>
              </div>
            </motion.div>
            
            {/* LEAD GEN FORM VINTAGE */}
            <motion.div id="tu-van" variants={fadeUp} style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
               <div style={{ width: '100%', maxWidth: '450px', backgroundColor: '#F4F1EA', padding: '2.5rem', borderRadius: '4px', border: '1px solid var(--brand-teal)', boxShadow: '10px 10px 0px rgba(61, 56, 49, 1)' }}>
                 <h3 style={{ fontSize: '1.75rem', color: 'var(--brand-teal)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>Đăng Ký Tư Vấn & Báo Giá</h3>
                 
                 <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                     {formStatus === 'error' && (
                        <div style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>Đã có lỗi xảy ra, vui lòng thử lại hoặc gọi Hotline!</div>
                     )}
                     <div>
                       <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Họ và Tên *</label>
                       <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }} placeholder="Nguyễn Văn A" />
                     </div>
                     <div>
                       <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Số điện thoại *</label>
                       <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }} placeholder="0909..." />
                     </div>
                     <div>
                       <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Dịch vụ quan tâm *</label>
                       <select required value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}>
                         <option value="">-- Chọn dịch vụ --</option>
                         <option value="Sang tên đổi chủ">Sang tên đổi chủ</option>
                         <option value="Thu hồi biển số (Rút gốc)">Thu hồi biển số (Rút gốc)</option>
                         <option value="Cấp đổi, cấp lại giấy tờ">Cấp đổi, cấp lại giấy tờ</option>
                         <option value="Dịch vụ khác">Dịch vụ khác</option>
                       </select>
                     </div>
                     <div>
                       <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Lời nhắn thêm (Tùy chọn)</label>
                       <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', minHeight: '80px', borderRadius: '4px' }} placeholder="Ghi chú thêm..."></textarea>
                     </div>
                      <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: "var(--brand-yellow)", color: "var(--brand-teal)" }} 
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={formStatus === 'loading'} 
                        className="btn btn-teal" 
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem', border: 'none', cursor: 'pointer' }}
                      >
                        {formStatus === 'loading' ? 'Đang gửi...' : 'GỬI YÊU CẦU NGAY'}
                      </motion.button>
                   </form>
               </div>
            </motion.div>
          </motion.div>
        </section>

        {/* EXTENDED SERVICES SECTION */}
        <section id="dich-vu" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="container">
            <motion.div variants={fadeUp} className="text-center">
              <h2 className="section-title">Dịch Vụ Của Chúng Tôi</h2>
              <p className="section-subtitle">Lo liệu mọi thủ tục giấy tờ với cái tâm của người trong nghề. An toàn, hợp pháp và bảo mật.</p>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
              
              {/* Nhóm 1 */}
              <motion.div variants={fadeUp} whileHover={{ y: -10 }} className="vintage-card">
                <h3 style={{ fontSize: '1.5rem', color: 'var(--brand-teal)', marginBottom: '1rem' }}>1. Thu Hồi Đăng Ký & Biển Số</h3>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '1rem', paddingLeft: '1.2rem', listStyleType: 'square', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li>Thu hồi khi chuyển quyền sở hữu (bán, tặng cho, thừa kế).</li>
                  <li>Thu hồi xe hết niên hạn, xe hỏng hoặc mất cắp.</li>
                  <li>Hỗ trợ xử lý nộp phạt chậm sang tên quá 30 ngày.</li>
                </ul>
                <div style={{ marginTop: '1rem' }}>
                   <Link href="/thu-tuc-thu-hoi-dang-ky" style={{ color: 'var(--brand-red)', fontWeight: 'bold', fontSize: '0.9rem' }}>Xem chi tiết thủ tục &rarr;</Link>
                </div>
              </motion.div>

              {/* Nhóm 2 */}
              <motion.div variants={fadeUp} whileHover={{ y: -10 }} className="vintage-card">
                <h3 style={{ fontSize: '1.5rem', color: 'var(--brand-teal)', marginBottom: '1rem' }}>2. Đăng Ký Xe & Sang Tên Đổi Chủ</h3>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '1rem', paddingLeft: '1.2rem', listStyleType: 'square', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li>Đăng ký xe mới & bấm biển số lần đầu.</li>
                  <li>Sang tên trọn gói ô tô, xe máy (cùng/chuyển tỉnh).</li>
                  <li>Đăng ký, cấp biển số xe trúng đấu giá.</li>
                  <li>Đăng ký xe tạm thời (xe di chuyển, quá cảnh).</li>
                </ul>
                <div style={{ marginTop: '1rem' }}>
                   <Link href="/thu-tuc-sang-ten-xe" style={{ color: 'var(--brand-red)', fontWeight: 'bold', fontSize: '0.9rem' }}>Xem chi tiết thủ tục &rarr;</Link>
                </div>
              </motion.div>

              {/* Nhóm 3 */}
              <motion.div variants={fadeUp} whileHover={{ y: -10 }} className="vintage-card">
                <h3 style={{ fontSize: '1.5rem', color: 'var(--brand-teal)', marginBottom: '1rem' }}>3. Xử Lý Ca Khó - Xe Vắng Chủ</h3>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '1rem', paddingLeft: '1.2rem', listStyleType: 'square', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li>Hỗ trợ sang tên xe qua nhiều đời chủ, không tìm được chủ gốc.</li>
                  <li>Lập giấy cam kết nguồn gốc xe hợp pháp.</li>
                  <li>Xử lý thủ tục niêm yết công khai 30 ngày.</li>
                </ul>
              </motion.div>

              {/* Nhóm 4 */}
              <motion.div variants={fadeUp} whileHover={{ y: -10 }} className="vintage-card">
                <h3 style={{ fontSize: '1.5rem', color: 'var(--brand-teal)', marginBottom: '1rem' }}>4. Cấp Đổi, Cấp Lại & Cải Tạo Xe</h3>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '1rem', paddingLeft: '1.2rem', listStyleType: 'square', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li>Cấp lại Cà vẹt/Biển số bị mất, mờ, rách, hỏng.</li>
                  <li>Đổi biển kinh doanh (Trắng &lt;-&gt; Vàng), đổi biển vuông/dài.</li>
                  <li>Đổi thông tin chủ xe (đổi địa chỉ, CCCD).</li>
                  <li>Hoán cải, thay đổi màu sơn xe.</li>
                </ul>
                <div style={{ marginTop: '1rem' }}>
                   <Link href="/thu-tuc-cap-doi-giay-to" style={{ color: 'var(--brand-red)', fontWeight: 'bold', fontSize: '0.9rem' }}>Xem chi tiết thủ tục &rarr;</Link>
                </div>
              </motion.div>

              {/* Nhóm 5 */}
              <motion.div variants={fadeUp} whileHover={{ y: -10 }} className="vintage-card">
                <h3 style={{ fontSize: '1.5rem', color: 'var(--brand-teal)', marginBottom: '1rem' }}>5. Dịch Vụ Nghiệp Vụ Hiện Trường</h3>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '1rem', paddingLeft: '1.2rem', listStyleType: 'square', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li>Cà số khung, số máy tận nơi (tại nhà, bãi xe).</li>
                  <li>Tra cứu, tính toán Lệ phí trước bạ, phí cấp đổi.</li>
                  <li>Rà soát phạt nguội, tình trạng thế chấp ngân hàng.</li>
                </ul>
              </motion.div>

            </div>

            {/* SOP SECTION */}
            <motion.div variants={fadeUp} style={{ marginTop: '4rem', backgroundColor: '#fff', padding: '3rem', borderRadius: '8px', border: '2px dashed var(--brand-teal)', boxShadow: 'var(--shadow-hard)' }}>
              <h3 style={{ fontSize: '2rem', color: 'var(--brand-red)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>Quy Trình Tiếp Nhận (SOP)</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', textAlign: 'center' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-teal)', marginBottom: '0.5rem' }}>01</div>
                  <strong style={{ color: 'var(--text-primary)' }}>Rà soát</strong><br/>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tra cứu phạt nguội, pháp lý xe</span>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-teal)', marginBottom: '0.5rem' }}>02</div>
                  <strong style={{ color: 'var(--text-primary)' }}>Nhận Hồ Sơ</strong><br/>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tiếp nhận giấy tờ vật lý/số hóa</span>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-teal)', marginBottom: '0.5rem' }}>03</div>
                  <strong style={{ color: 'var(--text-primary)' }}>Hiện Trường</strong><br/>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cà số khung máy, xét xe</span>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-teal)', marginBottom: '0.5rem' }}>04</div>
                  <strong style={{ color: 'var(--text-primary)' }}>Dịch Vụ Công</strong><br/>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Kê khai, nộp thuế trước bạ</span>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-teal)', marginBottom: '0.5rem' }}>05</div>
                  <strong style={{ color: 'var(--text-primary)' }}>Trả Kết Quả</strong><br/>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Giao Cavet/Biển số tận tay</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* KNOWLEDGE BASE SECTION (Cẩm nang) */}
        <section id="cam-nang" className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="container">
             <motion.div variants={fadeUp} className="text-center">
              <h2 className="section-title">Cẩm Nang Pháp Lý Hồ Sơ Xe</h2>
              <p className="section-subtitle">Chơi xe là một nghệ thuật, am hiểu luật pháp giúp cuộc chơi thêm phần trọn vẹn. SGM gửi bạn hữu những kiến thức nằm lòng.</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
               
               {/* Bài 1 */}
               <motion.div variants={fadeUp} whileHover={{ y: -10 }} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-hard)', border: '1px solid var(--brand-teal)' }}>
                 <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                   <Image src="/vintage_car_sale.png" alt="Sang tên xe" fill style={{ objectFit: 'cover' }} />
                 </div>
                 <div style={{ padding: '1.5rem' }}>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-teal)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                     Thủ tục Sang tên Ô tô, Xe máy từ A đến Z
                   </h3>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                     Quy trình pháp lý chi tiết giúp bạn chuyển nhượng chiếc xế hộp hoặc xe máy một cách suôn sẻ, an toàn.
                   </p>
                   <Link href="/thu-tuc-sang-ten-xe" style={{ color: 'var(--brand-red)', fontWeight: 700, textDecoration: 'none' }}>
                     Xem chi tiết &rarr;
                   </Link>
                 </div>
               </motion.div>

               {/* Bài 2 */}
               <motion.div variants={fadeUp} whileHover={{ y: -10 }} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-hard)', border: '1px solid var(--brand-teal)' }}>
                 <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                   <Image src="/vintage_license_plate.png" alt="Thu hồi đăng ký" fill style={{ objectFit: 'cover' }} />
                 </div>
                 <div style={{ padding: '1.5rem' }}>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-teal)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                     Hướng dẫn Thu hồi Đăng ký & Biển số xe
                   </h3>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                     Cập nhật Thông tư 79/2024/TT-BCA: "Xe đi, Biển ở lại" - Nắm vững quy định để không bị phạt.
                   </p>
                   <Link href="/thu-tuc-thu-hoi-dang-ky" style={{ color: 'var(--brand-red)', fontWeight: 700, textDecoration: 'none' }}>
                     Xem chi tiết &rarr;
                   </Link>
                 </div>
               </motion.div>

               {/* Bài 3 */}
               <motion.div variants={fadeUp} whileHover={{ y: -10 }} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-hard)', border: '1px solid var(--brand-teal)' }}>
                 <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                   <Image src="/vintage_lost_papers.png" alt="Cấp đổi giấy tờ" fill style={{ objectFit: 'cover' }} />
                 </div>
                 <div style={{ padding: '1.5rem' }}>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-teal)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                     Thủ tục Cấp đổi Giấy tờ, Biển số xe bị mất
                   </h3>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                     Không may đánh rơi ví mất Cavet xe? Biển số bị móp méo? Đọc ngay bài viết này để phục hồi lại giấy tờ.
                   </p>
                   <Link href="/thu-tuc-cap-doi-giay-to" style={{ color: 'var(--brand-red)', fontWeight: 700, textDecoration: 'none' }}>
                     Xem chi tiết &rarr;
                   </Link>
                 </div>
               </motion.div>

               {/* Bài 4 */}
               <motion.div variants={fadeUp} whileHover={{ y: -10 }} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-hard)', border: '1px solid var(--brand-teal)' }}>
                 <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                   <Image src="/phat_nguoi_camera.png" alt="Kiểm tra phạt nguội" fill style={{ objectFit: 'cover' }} />
                 </div>
                 <div style={{ padding: '1.5rem' }}>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-teal)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                     Hướng dẫn Kiểm Tra và Xử Lý Phạt Nguội
                   </h3>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                     Cách tra cứu lỗi vi phạm qua camera và quy trình đóng phạt, xóa lỗi trên hệ thống nhanh chóng.
                   </p>
                   <Link href="/kiem-tra-phat-nguoi" style={{ color: 'var(--brand-red)', fontWeight: 700, textDecoration: 'none' }}>
                     Xem chi tiết &rarr;
                   </Link>
                 </div>
               </motion.div>

               {/* Bài 5 */}
               <motion.div variants={fadeUp} whileHover={{ y: -10 }} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-hard)', border: '1px solid var(--brand-teal)' }}>
                 <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                   <Image src="/uy_quyen_xe.png" alt="Ủy quyền xe" fill style={{ objectFit: 'cover' }} />
                 </div>
                 <div style={{ padding: '1.5rem' }}>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-teal)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                     Quy Định Về Giấy Ủy Quyền Mua Bán Xe
                   </h3>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                     Hợp đồng ủy quyền xe có giá trị bao lâu? Có được phép làm thủ tục sang tên khi chỉ có giấy ủy quyền?
                   </p>
                   <Link href="/quy-dinh-uy-quyen-xe" style={{ color: 'var(--brand-red)', fontWeight: 700, textDecoration: 'none' }}>
                     Xem chi tiết &rarr;
                   </Link>
                 </div>
               </motion.div>

               {/* Bài 6 */}
               <motion.div variants={fadeUp} whileHover={{ y: -10 }} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-hard)', border: '1px solid var(--brand-teal)' }}>
                 <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                   <Image src="/bien_so_vang.png" alt="Biển số vàng" fill style={{ objectFit: 'cover' }} />
                 </div>
                 <div style={{ padding: '1.5rem' }}>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-teal)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                     Đổi Biển Số Vàng Cho Xe Kinh Doanh
                   </h3>
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                     Những lưu ý quan trọng khi cấp đổi biển số vàng và thủ tục rút hồ sơ trả lại biển trắng.
                   </p>
                   <Link href="/doi-bien-so-vang" style={{ color: 'var(--brand-red)', fontWeight: 700, textDecoration: 'none' }}>
                     Xem chi tiết &rarr;
                   </Link>
                 </div>
               </motion.div>

            </div>
          </motion.div>
        </section>

        {/* PRICING TABLE & FORM */}
        <section id="bang-gia" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'flex-start' }}>
            
            {/* BẢNG GIÁ */}
            <motion.div variants={fadeUp} style={{ flex: '2 1 600px' }}>
              <h2 className="section-title">Bảng Giá Tham Khảo</h2>
              <p className="section-subtitle" style={{ margin: '1rem 0 2rem 0', textAlign: 'left' }}>Tiền bạc phân minh, ái tình dứt khoát. Dưới đây là mức phí cơ bản. Tùy vào độ "khoai" của hồ sơ, anh em ta sẽ bàn bạc cụ thể để chốt mức giá hợp lý nhất.</p>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="table-vintage">
                  <thead>
                    <tr>
                      <th>Hạng Mục Dịch Vụ</th>
                      <th>TP. Hồ Chí Minh</th>
                      <th>Các Tỉnh Khác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Rút hồ sơ gốc Ô tô</td>
                      <td className="text-red" style={{ fontWeight: 700 }}>2.500.000đ</td>
                      <td className="text-red" style={{ fontWeight: 700 }}>2.800.000đ</td>
                    </tr>
                    <tr>
                      <td>Đăng ký xe Ô tô</td>
                      <td className="text-red" style={{ fontWeight: 700 }}>2.300.000đ</td>
                      <td className="text-red" style={{ fontWeight: 700 }}>2.800.000đ</td>
                    </tr>
                    <tr>
                      <td>Sang tên trọn gói Ô tô</td>
                      <td className="text-teal" style={{ fontWeight: 700 }}>4.500.000đ</td>
                      <td className="text-teal" style={{ fontWeight: 700 }}>5.000.000đ</td>
                    </tr>
                    <tr>
                      <td>Rút hồ sơ gốc Xe máy</td>
                      <td className="text-red" style={{ fontWeight: 700 }}>1.500.000đ</td>
                      <td className="text-red" style={{ fontWeight: 700 }}>1.800.000đ</td>
                    </tr>
                    <tr>
                      <td>Đăng ký Xe máy</td>
                      <td className="text-red" style={{ fontWeight: 700 }}>1.200.000đ</td>
                      <td className="text-red" style={{ fontWeight: 700 }}>2.000.000đ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: '1.5rem', color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                * Với các dòng Mô tô PKL, xe cổ, xe hoán cải hoặc thất lạc giấy tờ... quý khách vui lòng liên hệ trực tiếp để anh em thẩm định thực tế.
              </p>
            </motion.div>

            {/* FORM */}
            <motion.div variants={fadeUp} id="tu-van" className="vintage-card" style={{ flex: '1 1 350px', backgroundColor: 'var(--bg-primary)' }}>
              <h3 style={{ fontSize: '2.5rem', color: 'var(--brand-teal)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Gắn Kết</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>Chỉ cần để lại lời nhắn, người của SGM sẽ chủ động gọi điện tư vấn cặn kẽ cho bạn hữu.</p>
              
              <form>
                <div className="form-group">
                  <label className="form-label">Tên xưng hô</label>
                  <input type="text" className="form-input" placeholder="Nguyễn Văn A" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại liên lạc</label>
                  <input type="tel" className="form-input" placeholder="0909 xxx xxx" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tâm tư cần hỗ trợ</label>
                  <select className="form-select" required>
                    <option value="sang_ten">Sang tên / Đổi chủ</option>
                    <option value="rut_ho_so">Rút hồ sơ gốc</option>
                    <option value="cap_lai">Cấp lại giấy tờ / Biển số</option>
                    <option value="khac">Việc pháp lý khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tình trạng thực tế của xe</label>
                  <textarea className="form-textarea" rows={3} placeholder="Ví dụ: Xe vắng chủ, xe khác tỉnh..."></textarea>
                </div>
                <button type="submit" className="btn btn-teal" style={{ width: '100%', marginTop: '1rem' }}>GỬI TIN NHẮN</button>
              </form>
            </motion.div>

          </motion.div>
        </section>
        
        {/* VINTAGE IMAGE BANNER with Parallax feel */}
        <section style={{ height: '400px', position: 'relative', overflow: 'hidden' }}>
            <Image src="/vintage_paperwork_safe.png" alt="Vintage Paperwork" fill style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(46, 111, 103, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <h2 style={{ color: '#F4F1EA', fontSize: '3rem', fontFamily: 'var(--font-heading)', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', textAlign: 'center', padding: '0 2rem' }}>
                 Tận Tâm - Chuẩn Xác - Bảo Mật
               </h2>
            </div>
        </section>

      </main>

    </>
  );
}
