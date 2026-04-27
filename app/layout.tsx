import type { Metadata } from 'next';
import { Barlow_Condensed, Mulish, Share_Tech_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

const mulish = Mulish({
  variable: '--font-mulish',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const shareTechMono = Share_Tech_Mono({
  variable: '--font-share-tech-mono',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HoopsBox — Basketball Daily Puzzle',
  description: 'Fill the 3×3 grid with basketball players that match both row and column criteria. New puzzle every day!',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${barlowCondensed.variable} ${mulish.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
