/**
 * AI MART PRO — Official Shared Design System Tokens
 *
 * Dual-Accent Architecture:
 * 1. Teal (#0B7A6C) -> Primary marketplace actions, Add to Cart, Buy Now, shopping buttons.
 * 2. Orange (#F26A1B) -> Global navigation rail, brand wordmark accents, active nav state, badges.
 * 3. Yellow (#FFC531) -> Promotions, PRO badge, flash deals, star ratings.
 * 4. AI Purple/Magenta (#6D28D9 -> #C026D3) -> Exclusive to AI components, Nova, AI chips, AI Studio.
 * 5. Sale Red (#E53935) -> Discounts, urgent stock indicators, errors.
 */

export const TOKENS = {
  marketplace: {
    primaryTeal: '#0B7A6C',
    teal600: '#09665A',
    teal700: '#075E54',
    tealLight: '#E6F4F1',
    yellowAccent: '#FFC531',
    saleRed: '#E53935',
    ink: '#1B1F23',
    muted: '#6B7280',
    border: '#E5E7EB',
    background: '#F5F7F8',
    surface: '#FFFFFF',
  },
  navigation: {
    railBg: '#17181B',
    railGradient: 'linear-gradient(180deg, #1E2024, #141518)',
    railShadow: '0 14px 40px rgba(0,0,0,0.28)',
    railInnerBorder: 'rgba(255,255,255,0.04)',
    iconDefault: '#9CA3AF',
    iconHover: '#FFFFFF',
    orangeBrand: '#F26A1B',
    orangeLight: '#FF9A55',
    orangeActive: '#F26A1B',
    orangeBadge: '#FF7A2F',
    orangePageGlow: '#FFE9D9',
    orangeCardBorder: '#FFE3D1',
    orangeGradient: 'linear-gradient(135deg, #F26A1B, #FF9A55)',
    shellBackground: 'radial-gradient(900px 500px at 85% -10%, #FFE9D9 0%, transparent 60%), #FAFAFA',
  },
  ai: {
    purple: '#6D28D9',
    magenta: '#C026D3',
    gradient: 'linear-gradient(135deg, #6D28D9, #C026D3)',
    lightBg: '#F5F3FF',
    border: '#DDD6FE',
  },
  layout: {
    maxWidth: '1320px',
    desktopRailWidth: '68px',
    tabletRailWidth: '60px',
    desktopContentOffset: '112px',
    tabletContentOffset: '96px',
    topBarHeight: '64px',
  },
} as const;
