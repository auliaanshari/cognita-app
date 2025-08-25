// src/components/CreateTaskForm.js

'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

// Impor komponen-komponen dari shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CreateTaskForm({ onTaskCreated, onCancel, boardId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [menteeId, setMenteeId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mentees, setMentees] = useState([]);

  // Mengambil daftar mentee saat komponen dimuat
  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const response = await api.get('/users/mentees');
        setMentees(response.data);
      } catch (err) {
        console.error('Gagal mengambil daftar mentee', err);
        setError('Tidak dapat memuat daftar mentee.');
      }
    };
    fetchMentees();
  }, []);

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!menteeId) {
      toast.error('Silakan pilih seorang mentee.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/tasks', {
        title,
        description,
        menteeId,
        boardId, // Mengirim boardId yang diterima dari props
      });

      toast.success(`Tugas "${title}" berhasil dibuat!`);
      onTaskCreated(response.data); // Memberi sinyal ke parent bahwa tugas telah dibuat
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Gagal membuat tugas.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Tugas</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Contoh: Selesaikan Modul Backend"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Jelaskan detail tugas di sini..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mentee">Berikan kepada Mentee</Label>
        <Select onValueChange={setMenteeId} value={menteeId}>
          <SelectTrigger id="mentee">
            <SelectValue placeholder="-- Pilih Mentee --" />
          </SelectTrigger>
          <SelectContent>
            {mentees.map((mentee) => (
              <SelectItem key={mentee._id} value={mentee._id}>
                {mentee.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Tugas'}
        </Button>
      </div>
    </form>
  );
}
