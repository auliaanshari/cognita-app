// src/components/CommentModal.js
'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import pusher from '@/lib/pusher';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Impor komponen baru
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function CommentModal({ task, isOpen, onClose, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const commentEndRef = useRef(null);

  useEffect(() => {
    // Hanya fetch jika modal terbuka
    if (isOpen) {
      setIsLoading(true);
      api
        .get(`/tasks/${task._id}/comments`)
        .then((response) => setComments(response.data))
        .catch((error) => console.error('Gagal memuat komentar:', error))
        .finally(() => setIsLoading(false));

      const channel = pusher.subscribe(`task-${task._id}`);
      const handleNewComment = (newComment) => {
        setComments((prevComments) => [...prevComments, newComment]);
      };

      channel.bind('comment:added', handleNewComment);

      return () => {
        channel.unbind('comment:added', handleNewComment);
        pusher.unsubscribe(`task-${task._id}`);
      };
    }
  }, [isOpen, task._id]); // Jalankan ulang jika task atau status modal berubah

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const socketId = pusher.connection.socket_id;
      await api.post(`/tasks/${task._id}/comments`, {
        text: newComment,
        socketId: socketId,
      });
      setNewComment('');
    } catch (error) {
      console.error('Gagal mengirim komentar:', error);
      toast.error('Gagal mengirim komentar.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Diskusi Tugas: {task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>

        {/* Area Komentar */}
        <div className="flex-1 py-4 overflow-y-auto space-y-4 px-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col items-start">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-10 w-full max-w-md" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-center">
              Belum ada komentar. Mulailah diskusi!
            </p>
          ) : (
            comments.map((comment) => {
              const isCurrentUser = comment.authorId._id === currentUserId;
              return (
                <div
                  key={comment._id}
                  className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-lg">
                    <span
                      className={`text-xs font-semibold ${isCurrentUser ? 'text-right mr-2' : 'text-left ml-2'}`}
                    >
                      {isCurrentUser ? 'Anda' : comment.authorId.username}
                    </span>
                    <div
                      // Beri warna berbeda untuk gelembung chat
                      className={`mt-1 p-3 rounded-lg ${
                        isCurrentUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t mt-auto">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              disabled={isPosting}
            />
            <Button type="submit" disabled={isPosting}>
              {isPosting ? 'Mengirim...' : 'Kirim'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
