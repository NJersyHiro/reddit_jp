import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Navigation/Header';
import { MobileBottomNav } from '@/components/Navigation/MobileBottomNav';

const inter = Inter({ subsets: ['latin'] });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
});

export const metadata: Metadata = {
  title: 'Itaita - Japanese Community Discussion Platform',
  description: 'A Reddit-style discussion platform optimized for Japanese internet culture',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#DC2626',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning className={`${inter.className} ${notoSansJP.variable}`}>
      <body className="bg-gray-50 dark:bg-dark-background text-gray-900 dark:text-gray-100" suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="pt-16 pb-20 md:pb-0 min-h-screen">
            {children}
          </main>
          <MobileBottomNav className="md:hidden" />
        </Providers>
      </body>
    </html>
  );
}