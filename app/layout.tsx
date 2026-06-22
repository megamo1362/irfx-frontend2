import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/app/providers';
import { LangProvider } from '@/app/i18n/LangContext';
import { ThemeProvider } from '@/app/i18n/ThemeContext';
import { ClientWrapper } from '@/app/i18n/ClientWrapper';
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
    default: 'MINDLURA | AI Fintech Trading & Psychology',
    template: '%s | MINDLURA',
  },
  description: 'AI Fintech Trading & Psychology Platform',
  keywords: ['trading', 'journal', 'AI', 'MT5', 'forex', 'coaching', 'fintech', 'psychology'],
  authors: [{ name: 'MINDLURA' }],
  creator: 'MINDLURA',
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
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="circuit-bg antialiased">
        <ThemeProvider>
          <LangProvider>
            <ClientWrapper>
              <Providers>{children}</Providers>
            </ClientWrapper>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
