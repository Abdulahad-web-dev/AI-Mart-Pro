import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import './redesign.css';
import './redesign-screens.css';
import 'leaflet/dist/leaflet.css';
import { AppProvider } from '@/lib/app-context';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Mart Pro | AI-Powered Multi-Vendor Marketplace',
  description:
    'Discover a curated selection of premium electronics and essentials, powered by intelligent logistics, verified sellers, and nationwide express dispatch in Pakistan.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${poppins.className} font-sans antialiased bg-[#F5F7F8] text-[#1B1F23]`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
