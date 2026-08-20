"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { useState } from "react";

export default function HeroSection() {
  const router = useRouter();
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
      router.push('/thank-you');
    } catch (err) {
      setFormStatus('error');
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <section className="section" style={{ position: 'relative', padding: '10rem 0 6rem 0', minHeight: '90vh', display: 'flex', alignItems: 'center', backgroundColor: '#e2d9c3' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.15 }}>
        <Image src="/vintage_shop.png" alt="Garage xe Sài Gòn uy tín" fill style={{ objectFit: 'cover' }} priority />
      </div>

      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem', width: '100%', position: 'relative', zIndex: 1 }}>
        <motion.div variants={fadeUp} style={{ flex: '1 1 500px', color: 'var(--text-primary)' }}>
          <div style={{ display: 'inline-block', padding: '0.25rem 1rem', border: '1px solid var(--brand-red)', color: 'var(--brand-red)', fontSize: '1rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Tín Nghĩa Dài Lâu</div>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, color: 'var(--brand-teal)' }}>
            Dịch Vụ Pháp Lý <br/><span className="text-red">Hồ Sơ Xe</span>
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '600px' }}>
            Chào người anh em mê xe! Dù là chuyển nhượng chiếc xế hộp tâm đắc hay dọn lại con &quot;ngựa sắt&quot; hai bánh kỷ niệm, <strong>SGM</strong> luôn ở đây. Hơn mười năm lăn lộn, chúng tôi thấu hiểu từng nỗi lo giấy tờ pháp lý của bạn. Hãy để chúng tôi lo liệu, êm ru và trọn vẹn!
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
        
        {/* LEAD GEN FORM */}
        <motion.div id="tu-van" variants={fadeUp} style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
           <div style={{ width: '100%', maxWidth: '450px', backgroundColor: '#F4F1EA', padding: '2.5rem', borderRadius: '4px', border: '1px solid var(--brand-teal)', boxShadow: '10px 10px 0px rgba(61, 56, 49, 1)' }}>
             <h2 style={{ fontSize: '1.75rem', color: 'var(--brand-teal)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>Đăng Ký Tư Vấn & Báo Giá</h2>
             
             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 {formStatus === 'error' && (
                    <div style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>Đã có lỗi xảy ra, vui lòng thử lại hoặc gọi Hotline!</div>
                 )}
                 <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Họ và Tên *</label>
                   <input id="hero-name" required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }} placeholder="Nguyễn Văn A" />
                 </div>
                 <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Số điện thoại *</label>
                   <input id="hero-phone" required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }} placeholder="0909..." />
                 </div>
                 <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Dịch vụ quan tâm *</label>
                   <select id="hero-service" required value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}>
                     <option value="">-- Chọn dịch vụ --</option>
                     <option value="Sang tên đổi chủ">Sang tên đổi chủ</option>
                     <option value="Thu hồi biển số (Rút gốc)">Thu hồi biển số (Rút gốc)</option>
                     <option value="Cấp đổi, cấp lại giấy tờ">Cấp đổi, cấp lại giấy tờ</option>
                     <option value="Dịch vụ khác">Dịch vụ khác</option>
                   </select>
                 </div>
                 <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>Lời nhắn thêm (Tùy chọn)</label>
                   <textarea id="hero-message" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', minHeight: '80px', borderRadius: '4px' }} placeholder="Ghi chú thêm..."></textarea>
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
  );
}
