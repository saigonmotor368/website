"use client";

import { motion } from "framer-motion";

export default function VietNamFlagBunting() {
  // Calculate a gentle hanging curve for the string
  const flags = Array.from({ length: 15 }); // 15 small flags across the screen

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '80px',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 60
    }}>
      {/* String */}
      <svg width="100%" height="80" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Simple straight string across */}
        <path d="M-50,15 Q50vw,40 110vw,15" fill="none" stroke="var(--text-secondary)" strokeWidth="1" opacity={0.5} />
      </svg>
      
      {/* Flags */}
      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', padding: '0 2%', position: 'relative', top: '12px' }}>
        {flags.map((_, i) => (
          <motion.div
            key={i}
            initial={{ rotate: -10 }}
            animate={{ rotate: [ -5, 5, -5 ] }}
            transition={{
              repeat: Infinity,
              duration: 3 + Math.random() * 2, // Randomize sway
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
            style={{
              width: 'clamp(24px, 4vw, 45px)',
              aspectRatio: '3/2',
              transformOrigin: 'top center',
              position: 'relative',
              marginTop: `${Math.sin((i / (flags.length - 1)) * Math.PI) * 10}px`, // Follow the curve slightly
            }}
          >
            {/* Draw a small Red Rectangular Flag with Yellow Star */}
            <svg viewBox="0 0 45 30" width="100%" height="100%" style={{ filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.3))' }}>
               {/* Red Rectangle */}
               <rect width="45" height="30" fill="#DA251D" />
               {/* Yellow Star */}
               <polygon points="22.5,6 25,13.5 32.5,13.5 26.5,18 29,25.5 22.5,21 16,25.5 18.5,18 12.5,13.5 20,13.5" fill="#FFFF00" />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
