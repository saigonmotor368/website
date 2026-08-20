"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="vintage-header" 
      style={{ position: 'fixed', width: '100%', top: 0, zIndex: 50 }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', position: 'relative' }}>
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
          {/* LOGO */}
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ position: 'relative', width: '80px', height: '80px' }}
          >
             <Image src="/logo_sgm.png" alt="SGM Logo" fill style={{ objectFit: 'contain' }} />
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: '1.75rem', color: 'var(--brand-red)', letterSpacing: '1px', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
              SAIGON<span className="text-teal">MOTOR</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Trực thuộc Công Ty TNHH Ô tô Xe Máy 368
            </div>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="nav-links desktop-only" style={{ display: 'flex', gap: '2rem', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
          <motion.div whileHover={{ y: -3, color: 'var(--brand-red)' }} transition={{ duration: 0.2 }}><Link href="/#dich-vu">Dịch Vụ</Link></motion.div>
          <motion.div whileHover={{ y: -3, color: 'var(--brand-red)' }} transition={{ duration: 0.2 }}><Link href="/#cam-nang">Cẩm Nang</Link></motion.div>
          <motion.div whileHover={{ y: -3, color: 'var(--brand-red)' }} transition={{ duration: 0.2 }}><Link href="/#bang-gia">Bảng Giá</Link></motion.div>
          <motion.div whileHover={{ y: -3, color: 'var(--brand-red)' }} transition={{ duration: 0.2 }}><Link href="/phap-ly-cam-ket">Pháp Lý & Cam Kết</Link></motion.div>
        </nav>
        <motion.div className="desktop-only" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/#tu-van" className="btn btn-teal">Nhận Báo Giá</Link>
        </motion.div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mobile-dropdown"
              style={{ display: 'flex', overflow: 'hidden' }}
            >
              <nav className="nav-links" style={{ display: 'flex', gap: '1.5rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                <Link href="/#dich-vu" onClick={() => setIsMobileMenuOpen(false)}>Dịch Vụ</Link>
                <Link href="/#cam-nang" onClick={() => setIsMobileMenuOpen(false)}>Cẩm Nang</Link>
                <Link href="/#bang-gia" onClick={() => setIsMobileMenuOpen(false)}>Bảng Giá</Link>
                <Link href="/phap-ly-cam-ket" onClick={() => setIsMobileMenuOpen(false)}>Pháp Lý</Link>
              </nav>
              <Link href="/#tu-van" className="btn btn-teal" onClick={() => setIsMobileMenuOpen(false)} style={{ marginTop: '1rem' }}>
                Nhận Báo Giá
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
