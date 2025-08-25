// components/Column.js
'use client';
import React from 'react';
import TaskItem from './TaskItem';
import { useAuth } from '@/context/AuthContext';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

export default function Column({ column, tasks, onTaskDelete, onAskAI }) {
  const { user } = useAuth();
  const { setNodeRef } = useDroppable({ id: column._id });

  // Return null or a placeholder if tasks isn't ready, to be extra safe
  if (!tasks) {
    return (
      <div className="flex flex-col w-72 bg-gray-100 rounded-lg p-2 flex-shrink-0"></div>
    );
  }

  // Add a check for 'task' to prevent the error
  const tasksInColumn = column.taskIds
    .map((taskId) => tasks.find((task) => task._id === taskId))
    .filter(Boolean);

  return (
    <div className="flex flex-col w-72 bg-gray-200/50 rounded-lg shadow-sm flex-shrink-0">
      <h3 className="font-semibold p-3 text-gray-800 border-b">
        {column.title}
      </h3>
      <SortableContext
        id={column._id}
        items={column.taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex-grow min-h-[200px] space-y-2">
          {tasksInColumn.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              status={column.title}
              userRole={user?.role}
              currentUserId={user?.id}
              onAskAI={onAskAI}
              onTaskDelete={onTaskDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
