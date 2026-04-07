import React from 'react';

export default function ScamSafeLogo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield body */}
        <path
          d="M24 4L6 12V22C6 33.1 13.7 43.1 24 46C34.3 43.1 42 33.1 42 22V12L24 4Z"
          fill="url(#shieldGrad)"
          stroke="url(#strokeGrad)"
          strokeWidth="1.5"
        />
        {/* Inner shield highlight */}
        <path
          d="M24 8L10 14.5V22.5C10 31.3 16.2 39.4 24 41.8C31.8 39.4 38 31.3 38 22.5V14.5L24 8Z"
          fill="url(#innerGrad)"
          opacity="0.4"
        />
        {/* Checkmark */}
        <path
          d="M16 24L21 29L32 18"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lock keyhole */}
        <circle cx="24" cy="34" r="2" fill="rgba(255,255,255,0.3)" />
        <defs>
          <linearGradient id="shieldGrad" x1="6" y1="4" x2="42" y2="46">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="strokeGrad" x1="6" y1="4" x2="42" y2="46">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="innerGrad" x1="10" y1="8" x2="38" y2="42">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className="font-bold text-white tracking-tight" style={{ fontSize: size * 0.55 }}>
          Scam<span style={{ color: '#F97316' }}>Safe</span>
        </span>
      )}
    </div>
  );
}
