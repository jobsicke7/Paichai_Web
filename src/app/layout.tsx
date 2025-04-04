// app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/component/ThemeProvider';
import GNB from '@/component/GNB';
import FNB from '@/component/FNB';
import MobileNavigation from '@/component/MobileNavigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paichai App',
  description: 'Paichai Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          <GNB />
          <main>{children}</main>
          <FNB />
          <MobileNavigation />
        </ThemeProvider>
      </body>
    </html>
  );
}