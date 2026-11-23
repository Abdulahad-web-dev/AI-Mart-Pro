import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marketplace colours
        teal: {
          DEFAULT: '#0B7A6C',
          600: '#09665A',
          700: '#075E54',
          light: '#E6F4F1',
        },
        yellow: {
          accent: '#FFC531',
        },
        sale: '#E53935',
        ink: '#1B1F23',
        muted: '#6B7280',
        border: '#E5E7EB',
        bg: '#F5F7F8',
        'bg-deep': '#EEF2F5',
        surface: '#FFFFFF',
        'surface-2': '#F5F7F8',
        input: '#FFFFFF',
        text: '#1B1F23',
        'text-muted': '#4B5563',
        'text-dim': '#6B7280',

        // Navigation & Orange accent colours
        rail: {
          DEFAULT: '#17181B',
          top: '#1E2024',
          bottom: '#141518',
        },
        orange: {
          DEFAULT: '#F26A1B',
          brand: '#F26A1B',
          light: '#FF9A55',
          active: '#F26A1B',
          badge: '#FF7A2F',
          glow: '#FFE9D9',
          border: '#FFE3D1',
        },
        accent: '#0B7A6C',
        'accent-2': '#09665A',
        'accent-ink': '#FFFFFF',
        navy: '#FFE9D9',
        danger: '#FEE2E2',
        'danger-text': '#E53935',
        success: '#0B7A6C',

        // AI colours
        ai: {
          purple: '#6D28D9',
          magenta: '#C026D3',
          light: '#F3E8FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        manrope: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        dmsans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '18px',
        hero: '20px',
        rail: '34px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(27,31,35,0.05), 0 8px 24px -12px rgba(27,31,35,0.10)',
        rail: '0 14px 40px rgba(0,0,0,0.28)',
        orange: '0 8px 22px -6px rgba(242,106,27,0.55)',
        teal: '0 8px 22px -6px rgba(11,122,108,0.45)',
        ai: '0 8px 24px -6px rgba(109,40,217,0.45)',
        glow: '0 10px 28px -8px rgba(242,106,27,0.45)',
      },
    },
  },
  plugins: [],
} satisfies Config;
