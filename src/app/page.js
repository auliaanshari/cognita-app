// src/app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';
import DemoInfo from '@/components/DemoInfo';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika pengecekan token selesai dan ternyata ada user (sudah login),
    // alihkan ke dasbor.
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Selama pengecekan token berlangsung, atau jika user sudah ada (dan sedang proses redirect),
  // tampilkan pesan loading. Ini mencegah form login berkedip sesaat.
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Hanya tampilkan form login jika pengecekan selesai DAN user tidak ada.
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Cognita
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          AI-Powered Guidance. Human-Centered Growth..
        </p>
      </div>
      <LoginForm />
      <DemoInfo />
    </main>
  );
}
