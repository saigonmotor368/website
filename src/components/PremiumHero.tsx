"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useSyncExternalStore, type MouseEvent } from "react";
import TrackedAnchor from "@/components/TrackedAnchor";

const ease = [0.22, 1, 0.36, 1] as const;
const subscribeToClient = () => () => undefined;

export default function PremiumHero() {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const allowMotion = mounted && !reduceMotion;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 24 });
  const imageX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], [-7, 7]);

  const trackPointer = (event: MouseEvent<HTMLElement>) => {
    const native = event.nativeEvent as unknown as { pointerType?: string };
    if (!allowMotion || native?.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => { pointerX.set(0); pointerY.set(0); };

  return (
    <section className="premium-hero" onMouseMove={trackPointer} onMouseLeave={resetPointer}>
      <motion.div className="premium-hero-image" style={allowMotion ? { x: imageX, y: imageY } : undefined} aria-hidden="true">
        <Image src="/sgm-hero-premium.png" alt="" fill priority sizes="100vw" />
      </motion.div>
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-glow hero-glow-one" aria-hidden="true" />
      <div className="hero-glow hero-glow-two" aria-hidden="true" />

      <div className="container premium-hero-inner">
        <motion.div className="premium-hero-copy" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          <motion.div className="hero-kicker" initial={false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.12, ease }}>
            <span className="kicker-dot" />
            15 năm kinh nghiệm thực tế
          </motion.div>
          <h1>
            <span className="hero-title-main">Anh/chị đang gặp khó khăn với thủ tục giấy tờ xe?</span>
            <span className="hero-title-accent">SGM đồng hành kiểm tra hồ sơ, hướng dẫn quy trình và đề xuất hướng xử lý phù hợp.</span>
          </h1>
          <p className="hero-copy">Đội ngũ Saigon Motor kiểm tra kỹ tình trạng giấy tờ, hướng dẫn rõ các bước và đề xuất phương án xử lý phù hợp cho từng ca — kể cả những hồ sơ phức tạp cần thẩm định cẩn trọng.</p>
          <div className="hero-actions">
            <TrackedAnchor className="btn btn-primary hero-call" href="tel:0704104104" eventName="call_click" placement="hero">
              <span className="call-icon">↗</span> Gọi 0704 104 104
            </TrackedAnchor>
            <Link className="btn btn-glass" href="#tu-van">Nhận tư vấn hồ sơ</Link>
          </div>
          <div className="hero-meta">
            <span>Hotline 24/7</span><span>Kiểm tra trước khi tiếp nhận</span><span>Chi phí minh bạch</span>
          </div>
        </motion.div>

      </div>
      <div className="hero-scroll"><span>Khám phá dịch vụ</span><i /></div>
    </section>
  );
}
