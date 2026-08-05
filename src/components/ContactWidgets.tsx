"use client";

import { motion } from "framer-motion";

export default function ContactWidgets() {
  const widgets = [
    {
      id: 'phone',
      url: 'tel:0704104104',
      color: '#28a745', // Green
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      ),
      label: 'Gọi ngay'
    },
    {
      id: 'zalo',
      url: 'https://zalo.me/0704104104',
      color: '#0068ff', // Zalo Blue
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40">
          <path fill="white" d="M50,15 C25.1,15 5,31.8 5,52.5 C5,64.6 12.6,75.3 24.3,81.3 C24.3,81.3 22,89.5 21,92.5 C20.7,93.5 21.8,94.3 22.7,93.8 C26.7,91.3 35.8,85.5 35.8,85.5 C40.3,86.8 45,87.5 50,87.5 C74.9,87.5 95,70.7 95,50 C95,29.3 74.9,15 50,15 Z" />
          <text x="50" y="54" fill="#0068ff" fontFamily="system-ui, Arial, sans-serif" fontSize="28" fontWeight="900" textAnchor="middle" dominantBaseline="middle" letterSpacing="-1">Zalo</text>
        </svg>
      ),
      label: 'Zalo'
    },
    {
      id: 'messenger',
      url: 'https://m.me/396499820207432',
      color: '#0084ff', // Messenger Blue
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.13 2 11.23c0 2.91 1.48 5.48 3.79 7.15V22l3.47-1.92c1.23.35 2.54.55 3.94.55 5.52 0 10-4.13 10-9.23S17.52 2 12 2zm1.09 12.43-2.9-3.1-5.63 3.1 6.18-6.55 2.9 3.1 5.63-3.1-6.18 6.55z"/></svg>
      ),
      label: 'Messenger'
    }
  ];

  return (
    <div className="contact-widgets-container">
      {widgets.map((widget, index) => (
        <motion.a
          key={widget.id}
          href={widget.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.15, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          className="contact-widget-item"
          style={{ backgroundColor: widget.color }}
          title={widget.label}
        >
          <div className="contact-widget-icon">{widget.icon}</div>
          <span className="contact-widget-label">{widget.label}</span>
          
          {/* Ripple effect for Phone */}
          {widget.id === 'phone' && (
            <motion.div
              className="pulse-ring"
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(40, 167, 69, 0.7)', '0 0 0 20px rgba(40, 167, 69, 0)']
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.a>
      ))}
    </div>
  );
}
