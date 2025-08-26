// src/components/TaskItem.js
'use client';
import { useState } from 'react';
import api from '@/lib/api';
import CommentModal from './CommentModal';
import { toast } from 'sonner';

import { Button } from './ui/button';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskItem({
  task,
  onAskAI,
  onTaskDelete,
  currentUserId,
  userRole,
}) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: transform
      ? '0 4px 8px rgba(0,0,0,0.2)'
      : '0 1px 3px rgba(0,0,0,0.1)',
    opacity: isDragging ? 0.25 : 1,
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        // Hanya komponen ini yang memanggil API delete
        await api.delete(`/tasks/${task._id}`);
        toast.success('Task deleted successfully.');

        // Beri sinyal ke parent untuk update UI
        if (onTaskDelete) {
          onTaskDelete(task._id);
        }
      } catch (error) {
        toast.error('Failed to delete task.');
      }
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-lg shadow-sm mb-2 group flex flex-col"
        {...attributes}
      >
        <div className="p-4 cursor-grab" {...listeners}>
          <h3 className="font-bold text-md text-gray-800">{task.title}</h3>
          <p className="text-gray-500 text-sm mt-1">
            For:{' '}
            <span className="font-medium text-gray-700">
              {task.menteeId?.username || 'N/A'}
            </span>
          </p>
          {userRole === 'mentee' && (
            <p className="text-gray-600 mt-2 text-sm">{task.description}</p>
          )}
        </div>
        <div className="flex justify-between items-center p-2 border-t bg-gray-50/50">
          {/* Status Badge */}
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
              task.status === 'To Do'
                ? 'bg-yellow-200 text-yellow-800'
                : task.status === 'In Progress'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-green-200 text-green-800'
            }`}
          >
            {task.status}
          </span>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {userRole === 'mentee' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAskAI(task)}
                className="text-blue-600 hover:text-blue-700 h-7"
              >
                Ask AI
              </Button>
            )}
            {userRole === 'mentor' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 h-7"
              >
                Delete
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommentModalOpen(true)}
              className="h-7"
            >
              Discuss
            </Button>
          </div>
        </div>
      </div>

      {isCommentModalOpen && (
        <CommentModal
          task={task}
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
