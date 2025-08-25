// src/components/Header.js

'use client';

import Link from 'next/link';
import Notifications from './Notifications';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <Link href="/">
        <h1 className="text-xl font-bold">Cognita</h1>
      </Link>
      <nav>
        {user && <Notifications />}
        {/* ... other nav items ... */}
      </nav>
    </header>
  );
}
