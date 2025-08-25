// src/components/DemoInfo.js

import { RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function DemoInfo() {
  return (
    <div className="w-full max-w-sm rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col space-y-1.5 text-center">
        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center justify-center gap-2">
          <RocketLaunchIcon className="h-6 w-6" />
          Coba Aplikasi!
        </h3>
        <p className="text-sm text-muted-foreground pt-1">
          Gunakan akun demo untuk merasakan fitur kolaborasi real-time.
        </p>
      </div>
      <div className="pt-6">
        <p className="text-sm font-medium mb-2">
          <strong>Saran Terbaik:</strong> Buka di dua browser (biasa &
          incognito) dan login sebagai kedua peran untuk melihat keajaiban
          real-time!
        </p>
        <div className="mt-4">
          <p className="font-semibold">Akun Mentor:</p>
          <ul className="text-sm list-none space-y-1 mt-1 text-muted-foreground">
            <li>
              <strong>Email:</strong> mentor.demo@email.com
            </li>
            <li>
              <strong>Password:</strong> password123
            </li>
          </ul>
        </div>
        <div className="mt-4">
          <p className="font-semibold">Akun Mentee:</p>
          <ul className="text-sm list-none space-y-1 mt-1 text-muted-foreground">
            <li>
              <strong>Email:</strong> mentee.demo@email.com
            </li>
            <li>
              <strong>Password:</strong> password123
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
