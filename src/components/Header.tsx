"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/tracking";
export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={close} aria-label="Saigon Motor - Trang chủ">
          <span className="brand-mark"><Image src="/logo_sgm.png" alt="" width={64} height={64} priority /></span>
          <span className="brand-copy">
            <span className="brand-name">SAIGON <span>MOTOR</span></span>
            <span className="brand-note">Nhánh dịch vụ của Công ty TNHH Ô tô Xe máy 368</span>
          </span>
        </Link>
        {open && <div className="mobile-menu-backdrop" onClick={close} aria-hidden="true" />}
        <nav id="main-navigation" aria-label="Điều hướng chính" className={open ? "main-nav desktop-nav mobile-open" : "main-nav desktop-nav"}>
          {open && (
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Danh mục dịch vụ</span>
              <button type="button" className="mobile-menu-close" onClick={close} aria-label="Đóng menu">
                ✕
              </button>
            </div>
          )}
          <Link href="/#dich-vu" onClick={close}>Dịch vụ</Link>
          <Link href="/#quy-trinh" onClick={close}>Quy trình</Link>
          <Link href="/#bang-gia" onClick={close}>Bảng giá</Link>
          <Link href="/phap-ly-cam-ket" onClick={close}>Thông tin pháp lý</Link>
          <a className="btn btn-primary mobile-menu-cta" href="tel:0704104104" onClick={() => { trackEvent("call_click", { placement: "mobile_menu" }); close(); }}>
            Gọi 0704 104 104
          </a>
        </nav>
        <a className="btn btn-primary header-cta" href="tel:0704104104" onClick={() => trackEvent("call_click", { placement: "header" })}>Gọi 0704 104 104</a>
        <button className="menu-toggle" type="button" onClick={() => setOpen(!open)} aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open} aria-controls="main-navigation">
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>
      </div>
    </header>
  );
}
