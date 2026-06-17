import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/app/providers';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Zenvora | AI-Powered Trading Journal',
    template: '%s | Zenvora',
  },
  description: 'AI-Powered Trading Intelligence Platform',
  keywords: ['trading', 'journal', 'AI', 'MT5', 'forex', 'coaching'],
  authors: [{ name: 'Zenvora' }],
  creator: 'Zenvora',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020510',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="circuit-bg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
