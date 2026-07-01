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

const siteTitle = 'Mindlura — Trading Psychology, Quantified | Forex Behavioral Analytics';
const siteDescription =
  'Connect your trading account and discover the behavioral patterns costing you money. MAE/MFE analysis, Psychology Score, emotion-aware journaling, and coach tools — currently supporting MT5, with cTrader coming soon.';
const siteUrl = 'https://mindlura.com';
const ogImage = 'https://mindlura.com/og-image.png';

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: '%s | Mindlura',
  },
  description: siteDescription,
  keywords: ['trading psychology', 'MT5 analytics', 'behavioral trading', 'forex journal', 'MAE MFE analysis', 'psychology score', 'trading coach', 'emotion-aware journal'],
  authors: [{ name: 'Mindlura' }],
  creator: 'Mindlura',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'Mindlura',
    type: 'website',
    images: [{ url: ogImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
