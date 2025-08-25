// src/app/layout.js

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Cognita',
  description: 'AI-Powered Guidance. Human-Centered Growth.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        {}
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
