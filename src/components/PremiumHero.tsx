"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
import TrackedAnchor from "@/components/TrackedAnchor";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PremiumHero() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 24 });
  const imageX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], [-7, 7]);
  const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  const trackPointer = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => { pointerX.set(0); pointerY.set(0); };

  return (
    <section className="premium-hero" onMouseMove={trackPointer} onMouseLeave={resetPointer}>
      <motion.div className="premium-hero-image" style={{ x: imageX, y: imageY }} aria-hidden="true">
        <Image src="/sgm-hero-premium.png" alt="" fill priority sizes="100vw" />
      </motion.div>
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-glow hero-glow-one" aria-hidden="true" />
      <div className="hero-glow hero-glow-two" aria-hidden="true" />

      <div className="container premium-hero-inner">
        <motion.div className="premium-hero-copy" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <motion.div className="hero-kicker" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.15, ease }}>
            <span className="kicker-dot" />
            Dịch vụ hồ sơ xe tại TP.HCM
          </motion.div>
          <h1>Bạn đang gặp khó khăn với thủ tục giấy tờ xe?<br /><span>Đã có SGM đồng hành cùng bạn.</span></h1>
          <p className="hero-copy">Với 15 năm kinh nghiệm thực tế, đội ngũ Saigon Motor sẽ kiểm tra giấy tờ, hướng dẫn quy trình và cùng bạn tìm hướng xử lý phù hợp — kể cả với những hồ sơ phức tạp cần được xem xét kỹ.</p>
          <div className="hero-actions">
            <TrackedAnchor className="btn btn-primary hero-call" href="tel:0704104104" eventName="call_click" placement="hero">
              <span className="call-icon">↗</span> Gọi 0704 104 104
            </TrackedAnchor>
            <Link className="btn btn-glass" href="#tu-van">Đăng ký nhận tư vấn</Link>
          </div>
          <div className="hero-meta">
            <span>Hotline 24/7</span><span>Kiểm tra hồ sơ trước</span><span>Báo rõ từng khoản chi phí</span>
          </div>
        </motion.div>

        <motion.div className="hero-orbit" style={{ rotateX: cardRotateX, rotateY: cardRotateY }} initial={{ opacity: 0, scale: 0.86, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, delay: 0.35, ease }}>
          <div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" />
          <div className="hero-process-card">
            <div className="process-card-top"><span>Quy trình SGM</span><i>Sẵn sàng hỗ trợ</i></div>
            <div className="process-line"><b>01</b><span><strong>Kiểm tra hồ sơ</strong><small>Xác định giấy tờ đang có</small></span><em>✓</em></div>
            <div className="process-line"><b>02</b><span><strong>Hướng dẫn và báo phí</strong><small>Làm rõ quy trình, chi phí</small></span><em>✓</em></div>
            <div className="process-line active"><b>03</b><span><strong>Thực hiện và theo dõi</strong><small>Cập nhật tiến độ đến khi bàn giao</small></span><em>→</em></div>
          </div>
          <motion.div className="experience-float" animate={{ y: [0, -9, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <strong>15</strong><span>năm kinh nghiệm<br />của đội ngũ</span>
          </motion.div>
        </motion.div>
      </div>
      <div className="hero-scroll"><span>Khám phá dịch vụ</span><i /></div>
    </section>
  );
}
