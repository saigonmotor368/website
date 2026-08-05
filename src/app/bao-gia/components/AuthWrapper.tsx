'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // 3D Tilt Effect variables
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "-100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "-100%"]);

  useEffect(() => {
    const authStatus = localStorage.getItem('sgm_quote_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_TOOL_PASSWORD || 'sgm368';
    
    if (password === CORRECT_PASSWORD) {
      setError('');
      setIsUnlocked(true);
      setTimeout(() => {
        localStorage.setItem('sgm_quote_auth', 'true');
        setIsAuthenticated(true);
      }, 1500); 
    } else {
      setError('Mã truy cập không hợp lệ!');
      setPassword('');
      x.set(0.1);
      setTimeout(() => x.set(-0.1), 100);
      setTimeout(() => x.set(0), 200);
    }
  };

  if (isChecking) return null;

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden font-sans">
        
        {/* Cinematic 4K Background Image */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full relative"
          >
            <Image 
              src="/premium_auth_bg.png" 
              alt="Premium Background" 
              fill 
              className="object-cover opacity-80"
              priority
            />
          </motion.div>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"></div>
        </div>

        <AnimatePresence>
          {!isUnlocked && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-lg p-6"
              style={{ perspective: 2000 }}
            >
              <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d"
                }}
                className="relative bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* Glare Effect */}
                <motion.div 
                  className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-40 mix-blend-overlay"
                  style={{
                    background: `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 60%)`,
                    x: glareX,
                    y: glareY,
                  }}
                />

                {/* Content */}
                <div style={{ transform: "translateZ(60px)" }} className="relative z-20">
                  
                  {/* Elegant Logo Area */}
                  <div className="flex flex-col items-center mb-10">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="relative mb-4 w-28 h-28 flex items-center justify-center"
                    >
                      <div className="absolute inset-0 bg-[#D4AF37] blur-3xl opacity-30 rounded-full animate-pulse"></div>
                      <Image src="/logo_sgm.png" alt="SGM" width={100} height={100} className="object-contain relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                    </motion.div>
                    
                    <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#F3E5AB] tracking-widest text-center drop-shadow-md">
                      SAIGON MOTOR
                    </h1>
                    <div className="flex items-center gap-4 mt-3 opacity-80">
                      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
                      <p className="text-[#D4AF37] font-medium tracking-[0.4em] text-[10px] uppercase drop-shadow-sm">
                        Cổng Nội Bộ
                      </p>
                      <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if(error) setError('');
                        }}
                        placeholder="Nhập mã xác thực"
                        className={`w-full bg-black/40 border ${error ? 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-white/20 focus:border-[#D4AF37] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(212,175,55,0.3)]'} rounded-2xl pl-12 pr-6 py-4 text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-lg tracking-[0.2em] font-light`}
                        autoFocus
                      />
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                          className="absolute -bottom-8 left-0 right-0 text-center text-red-400 text-xs font-medium tracking-wider"
                        >
                          {error}
                        </motion.div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="relative w-full overflow-hidden rounded-2xl group pt-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-[#D4AF37] to-yellow-600 opacity-80 group-hover:opacity-100 transition-opacity blur-md"></div>
                      <div className="relative bg-gradient-to-r from-[#C5A028] via-[#E8CD6C] to-[#C5A028] text-black font-bold tracking-[0.2em] text-lg rounded-2xl px-6 py-4 flex items-center justify-center gap-3 transition-transform transform group-hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_20px_rgba(212,175,55,0.4)] border border-yellow-200/50">
                        <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span>XÁC THỰC</span>
                      </div>
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}

          {isUnlocked && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
            >
              <motion.div 
                initial={{ opacity: 1, scale: 0.8 }}
                animate={{ opacity: 0, scale: 2.5 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 bg-[#D4AF37] rounded-full filter blur-3xl opacity-50"
              />
              <div className="relative bg-gradient-to-br from-[#F3E5AB] to-[#D4AF37] w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(212,175,55,0.8)] border-4 border-white/40">
                <svg className="w-16 h-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <>{children}</>;
}
