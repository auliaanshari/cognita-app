// src/components/AiTutorModal.js
'use client';
import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner'; // <-- 1. Impor toast
import { Skeleton } from '@/components/ui/skeleton'; // <-- 2. Impor Skeleton

// Impor komponen shadcn/ui
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function AiTutorModal({
  task,
  isOpen,
  onClose,
  conversation,
  setConversation,
}) {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: 'user', text: userInput };
    setConversation((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/ask', {
        question: userInput,
        taskId: task._id,
      });
      const aiMessage = { role: 'model', text: response.data.answer };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Gagal bertanya pada AI', error);
      toast.error('Terjadi kesalahan saat menghubungi AI Tutor.');
      const errorMessage = {
        role: 'model',
        text: 'Maaf, terjadi kesalahan. Coba ulangi beberapa saat lagi.',
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader className="p-6">
          <DialogTitle className="text-2xl">AI Tutor</DialogTitle>
          <DialogDescription>
            Ajukan pertanyaan tentang tugas: "{task.title}"
          </DialogDescription>
        </DialogHeader>

        {/* Area Chat */}
        <div className="flex-1 px-6 pb-4 overflow-y-auto space-y-4">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-xl ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'}`}
              >
                <div className="prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-ol:my-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-gray-100 space-y-2 w-fit">
                <Skeleton className="h-4 w-48 bg-gray-300" />
                <Skeleton className="h-4 w-32 bg-gray-300" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t mt-auto">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ketik pertanyaan Anda di sini..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '...' : 'Kirim'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
