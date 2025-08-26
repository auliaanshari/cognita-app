// src/components/Board.js

'use client';
import React, { useEffect, useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import pusher from '@/lib/pusher';
import api from '@/lib/api';
import { useBoardStore } from '@/store/boardStore';
import { useAuth } from '@/context/AuthContext';

// Import all necessary components
import MentorDashboard from './MentorDashboard';
import TaskItem from './TaskItem';
import Column from './Column';
import AiTutorModal from './AiTutorModal';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import TaskListSkeleton from './skeletons/TaskListSkeleton';
import { Skeleton } from './ui/skeleton';

export default function Board({ boardId }) {
  const loading = useBoardStore((state) => state.loading);
  const boardData = useBoardStore((state) => state.boardData);
  const {
    fetchBoard,
    moveCard,
    updateTask,
    addTask,
    removeTask,
    reorderCardInColumn,
    setColumnTaskIds,
  } = useBoardStore();
  const { user, logout } = useAuth();
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    if (!user || !boardId) return;

    fetchBoard(boardId);

    const channel = pusher.subscribe(`board-${boardId}`);

    const handleTaskAdded = (newTask) => {
      addTask(newTask);
      if (user.role === 'mentee' && newTask.menteeId._id === user.id) {
        toast.success(`Tugas baru dari mentor: "${newTask.title}"`);
      }
    };

    const handleTaskRemoved = (data) => removeTask(data.taskId);
    const handleCardMoved = (data) => {
      moveCard(data.taskId, data.sourceColumnId, data.destColumnId);
      if (data.updatedTask) updateTask(data.updatedTask);
    };
    const handleCardReordered = (data) => {
      setColumnTaskIds(data.columnId, data.taskIds);
    };

    channel.bind('task:added', handleTaskAdded);
    channel.bind('task:removed', handleTaskRemoved);
    channel.bind('card:moved', handleCardMoved);
    channel.bind('card:reordered', handleCardReordered);

    return () => {
      pusher.unsubscribe(`board-${boardId}`);
    };
  }, [
    boardId,
    user,
    addTask,
    removeTask,
    moveCard,
    updateTask,
    setColumnTaskIds,
    fetchBoard,
  ]);

  function handleDragStart(event) {
    if (!boardData?.tasks) return;
    const card = boardData.tasks.find((t) => t._id === event.active.id);
    setActiveCard(card);
  }

  function handleDragEnd(event) {
    setActiveCard(null);
    if (!boardData) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    const socketId = pusher.connection.socket_id;

    if (activeContainer === overContainer) {
      if (activeId !== overId) {
        const activeColumn = boardData.columns.find(
          (c) => c._id === activeContainer
        );
        if (!activeColumn) return;
        const oldIndex = activeColumn.taskIds.indexOf(activeId);
        const newIndex = activeColumn.taskIds.indexOf(overId);

        reorderCardInColumn(activeContainer, oldIndex, newIndex); // Update UI

        const newOrderedIds = arrayMove(
          activeColumn.taskIds,
          oldIndex,
          newIndex
        );

        api
          .put(
            '/drag/reorder',
            {
              columnId: activeContainer,
              taskIds: newOrderedIds,
              socketId: socketId,
            },
            { params: { boardId } }
          )
          .catch((err) => {
            toast.error('Gagal menyimpan urutan kartu.');
            // Logika untuk mengembalikan urutan jika gagal
          });
      }
    } else {
      if (!activeContainer || !overContainer) return;

      const overColumn = boardData.columns.find((c) => c._id === overContainer);
      if (!overColumn) return;

      const newStatus = overColumn.title;

      useBoardStore
        .getState()
        .moveTaskAndUpdateStatus(
          activeId,
          activeContainer,
          overContainer,
          newStatus
        );

      api
        .put(
          '/drag/move',
          {
            taskId: activeId,
            sourceColumnId: activeContainer,
            destColumnId: overContainer,
            socketId: socketId,
          },
          { params: { boardId } }
        )
        .catch((err) => {
          toast.error('Gagal memindahkan kartu.');
          // Logika untuk mengembalikan kartu jika gagal
        });
    }
  }

  const handleTaskCreated = (newTask) => {
    addTask(newTask);
  };

  const handleTaskDelete = (taskId) => {
    removeTask(taskId);
  };

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedTaskForAI, setSelectedTaskForAI] = useState(null);
  const [conversation, setConversation] = useState([]);

  const handleAskAI = (task) => {
    if (selectedTaskForAI?._id !== task._id) {
      setConversation([]);
    }
    setSelectedTaskForAI(task);
    setIsAiModalOpen(true);
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <Card className="w-full max-w-7xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-64 bg-gray-200" />
              <Skeleton className="h-10 w-48 bg-gray-200" />
            </div>
          </CardHeader>
          <CardContent>
            <TaskListSkeleton />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!boardData) return <div className="p-8">Board not found.</div>;

  console.log('Data di dalam komponen Board:', boardData);

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <Card className="w-full max-w-7xl mx-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-3xl">
                {boardData?.board.name || 'Project Board'}
              </CardTitle>
              <p className="mt-1 text-gray-600">Welcome, {user.username}!</p>
            </div>
            <div className="flex items-center gap-2">
              {user.role === 'mentor' && (
                <MentorDashboard
                  onTaskCreated={handleTaskCreated}
                  boardId={boardId}
                />
              )}
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCorners}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {boardData.columns.map((column) => (
                <Column
                  key={column._id}
                  column={column}
                  tasks={boardData.tasks}
                  onAskAI={handleAskAI}
                  onTaskDelete={handleTaskDelete}
                />
              ))}
            </div>
            <DragOverlay>
              {activeCard ? (
                <TaskItem task={activeCard} status={activeCard.status} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
      {isAiModalOpen && selectedTaskForAI && (
        <AiTutorModal
          task={selectedTaskForAI}
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          conversation={conversation}
          setConversation={setConversation}
        />
      )}
    </main>
  );
}
