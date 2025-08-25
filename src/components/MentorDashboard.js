// src/components/MentorDashboard.js
'use client';
import { useState } from 'react';
import CreateTaskForm from './CreateTaskForm';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function MentorDashboard({ onTaskCreated, boardId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewTaskCreated = (newTask) => {
    onTaskCreated(newTask);
    setIsModalOpen(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>+ Buat Tugas Baru</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Tugas Baru</DialogTitle>
        </DialogHeader>
        <CreateTaskForm
          onTaskCreated={handleNewTaskCreated}
          onCancel={() => setIsModalOpen(false)}
          boardId={boardId}
        />
      </DialogContent>
    </Dialog>
  );
}
