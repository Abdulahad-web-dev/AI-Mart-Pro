'use client';
import React from 'react';

export interface AIMartLogoProps {
  variant?: 'full' | 'mark';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  theme?: 'light' | 'dark';
  className?: string;
}

export function AIMartLogo({
  variant = 'full',
  size = 'md',
  theme = 'light',
  className = '',
}: AIMartLogoProps) {
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 36
      : size === 'lg'
      ? 48
      : size === 'xl'
      ? 56
      : 40;

  const mark = (
    <div
      style={{
        width: numericSize,
        height: numericSize,
        borderRadius: Math.round(numericSize * 0.32),
        background: 'linear-gradient(135deg, #0B7A6C 0%, #09665A 100%)',
        boxShadow: '0 6px 16px -4px rgba(11, 122, 108, 0.5)',
      }}
      className="relative inline-flex items-center justify-center flex-shrink-0 select-none"
    >
      <svg
        width={Math.round(numericSize * 0.58)}
        height={Math.round(numericSize * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3L4.5 20.5H8.2L9.8 16.5H14.2L15.8 20.5H19.5L12 3ZM10.9 13.5L12 10.4L13.1 13.5H10.9Z"
          fill="#FFFFFF"
        />
        <circle cx="18.5" cy="5.5" r="2.2" fill="#FFC531" />
      </svg>
    </div>
  );

  if (variant === 'mark') return mark;

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#1B1F23]';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {mark}
      <div className="flex items-center gap-1.5">
        <span className={`font-extrabold text-lg tracking-tight leading-none ${textColor}`}>
          <span className="text-[#0B7A6C]">AI</span> MART
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-[#FFC531] text-[#1B1F23] text-[10px] font-extrabold uppercase tracking-wider leading-none">
          PRO
        </span>
      </div>
    </div>
  );
}

export default AIMartLogo;
