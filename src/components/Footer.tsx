"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer id="lien-he" className="bg-teal" style={{ padding: '5rem 0 0 0', overflow: 'hidden' }}>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', paddingBottom: '4rem' }}
      >
        
        <div>
          <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1.5rem' }}>
            <Image src="/logo_sgm.png" alt="SGM Logo" fill style={{ objectFit: 'contain' }} />
          </div>
          <h4 style={{ color: 'var(--brand-yellow)', fontSize: '1.2rem', marginBottom: '1rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Công ty TNHH Oto Xe Máy 368</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#DCD3BF' }}>
            <li><strong>MST:</strong> <span style={{ color: '#F4F1EA' }}>0316339254</span></li>
            <li><strong>Địa chỉ:</strong> 745 Phạm Văn Đồng, Kp8, P. Hiệp Bình Chánh, TP Hồ Chí Minh</li>
            <li><strong>Email:</strong> <a href="mailto:saigommotor68@gmail.com" className="text-yellow" style={{ textDecoration: 'none' }}>saigommotor68@gmail.com</a></li>
            <li><strong>Hotline:</strong> <motion.a whileHover={{ scale: 1.1, color: '#fff' }} href="tel:0704104104" className="text-yellow" style={{ display: 'inline-block', fontSize: '1.5rem', fontWeight: 800, textDecoration: 'none' }}>0704.104.104</motion.a></li>
          </ul>
        </div>

        <motion.div 
          whileHover={{ rotate: 0, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ border: '4px solid #DCD3BF', padding: '0.5rem', backgroundColor: '#F4F1EA', transform: 'rotate(-1deg)' }}
        >
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d979.6440091344593!2d106.74482236957297!3d10.843721216490096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529694d857ee5%3A0x295149ad047b9d78!2sC%C3%B4ng%20Ty%20TNHH%20OTO%20XE%20M%C3%81Y%20368!5e0!3m2!1svi!2s!4v1785209952676!5m2!1svi!2s" 
            width="100%" 
            height="300" 
            style={{ border: 0, display: 'block' }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </motion.div>

      </motion.div>
      
      <div style={{ borderTop: '1px solid rgba(244, 241, 234, 0.2)', padding: '2rem 0', textAlign: 'center', color: '#DCD3BF', fontSize: '0.95rem' }}>
        <p>&copy; {new Date().getFullYear()} Saigon Motor. Bản quyền thuộc Công ty TNHH Ô tô Xe máy 368.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#DCD3BF', fontStyle: 'italic', fontFamily: 'var(--font-heading)' }}>Tự hào tinh thần Việt Nam</span>
          <motion.div 
            animate={{ 
              rotate: [0, -2, 2, -1, 1, 0],
              skewY: [0, -1.5, 1.5, -0.5, 0.5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: "easeInOut" 
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              transformOrigin: 'left center',
              boxShadow: '2px 4px 8px rgba(0,0,0,0.4)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="45" height="30">
              <rect width="300" height="200" fill="#da251d"/>
              <polygon points="150,40 167.6,94.3 224.7,94.3 178.6,127.9 196.2,182.1 150,148.6 103.8,182.1 121.4,127.9 75.3,94.3 132.4,94.3" fill="#ff0"/>
            </svg>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
