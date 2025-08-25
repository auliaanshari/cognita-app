// src/components/Board.js

'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { socket } from '@/lib/socket';
import { useBoardStore } from '@/store/boardStore';
import { useAuth } from '@/context/AuthContext';

// Import all necessary components
import MentorDashboard from './MentorDashboard';
import TaskItem from './TaskItem';
import Column from './Column';
import AiTutorModal from './AiTutorModal';
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
  } = useBoardStore.getState();
  const { user, logout } = useAuth();
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    if (!user) return;

    fetchBoard(boardId);

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log('Terhubung ke board socket!');
      socket.emit('board:join', boardId);
    };

    socket.on('connect', onConnect);

    const handleCardMoved = (data) => {
      console.log('Event card:moved diterima:', data);
      moveCard(data.cardId, data.sourceColumnId, data.destColumnId);
      if (data.updatedTask) {
        updateTask(data.updatedTask);
      }
    };

    const handleTaskAdded = (newTask) => addTask(newTask);
    const handleTaskRemoved = (data) => removeTask(data.taskId);

    const handleCardReordered = (data) => {
      setColumnTaskIds(data.columnId, data.taskIds);
    };

    socket.on('card:moved', handleCardMoved);
    socket.on('task:added', handleTaskAdded);
    socket.on('task:removed', handleTaskRemoved);
    socket.on('card:reordered', handleCardReordered);

    return () => {
      console.log('Memutuskan koneksi dari board socket...');
      socket.off('connect');
      socket.off('card:moved', handleCardMoved);
      socket.off('task:added', handleTaskAdded);
      socket.off('task:removed', handleTaskRemoved);
      socket.off('card:reordered', handleCardReordered);
    };
  }, [boardId, user?.id]);

  function handleDragStart(event) {
    const card = boardData.tasks.find((t) => t._id === event.active.id);
    setActiveCard(card);
  }

  function handleDragEnd(event) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      if (activeId !== overId) {
        const activeColumn = boardData.columns.find(
          (c) => c._id === activeContainer
        );
        const oldIndex = activeColumn.taskIds.indexOf(activeId);
        const newIndex = activeColumn.taskIds.indexOf(overId);

        reorderCardInColumn(activeContainer, oldIndex, newIndex); // Update UI

        const newOrderedIds = arrayMove(
          activeColumn.taskIds,
          oldIndex,
          newIndex
        );

        socket.emit('card:reorder', {
          boardId,
          columnId: activeContainer,
          taskIds: newOrderedIds,
        });
      }
    } else {
      const activeColumn = boardData.columns.find(
        (c) => c._id === activeContainer
      );
      const overColumn = boardData.columns.find((c) => c._id === overContainer);
      if (!activeColumn || !overColumn) return;

      moveCard(activeId, activeContainer, overContainer); // Update UI

      const task = boardData.tasks.find((t) => t._id === activeId);
      const newStatus = overColumn.title;

      updateTask({ ...task, status: newStatus }); // Update status di state

      socket.emit('card:move', {
        boardId,
        cardId: activeId,
        sourceColumnId: activeContainer,
        destColumnId: overContainer,
      });
    }
  }

  const handleTaskCreated = (newTask) => {
    addTask(newTask);
    socket.emit('task:add', { boardId, newTask });
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

  const handleCloseAiModal = () => {
    setIsAiModalOpen(false);
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
          onClose={handleCloseAiModal}
          conversation={conversation}
          setConversation={setConversation}
        />
      )}
    </main>
  );
}
