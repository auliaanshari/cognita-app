// src/app/register/page.js

import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <RegisterForm />
    </main>
  );
}
