// src/components/Notifications.js

'use client';
import { useEffect, useState } from 'react';
import pusher from '@/lib/pusher';
import { useAuth } from '@/context/AuthContext';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from './ui/button';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind('notification:new', (notification) => {
      console.log('🟣 Notifikasi Pusher diterima:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setHasUnread(true);
    });

    return () => {
      pusher.unsubscribe(`user-${user.id}`);
    };
  }, [user]);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setHasUnread(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          <BellIcon className="h-6 w-6 text-gray-600" />
          {hasUnread && (
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifikasi</h4>
            <p className="text-sm text-muted-foreground">
              Pemberitahuan tugas terbaru untuk Anda.
            </p>
          </div>
          <div className="grid gap-2">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 rounded-md p-2 transition-all hover:bg-accent"
                >
                  <CheckCircleIcon className="mt-1 h-5 w-5 text-green-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Tugas Baru
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">
                Belum ada notifikasi.
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
