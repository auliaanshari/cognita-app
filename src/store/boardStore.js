// src/store/boardStore.js

import { create } from 'zustand';
import api from '@/lib/api';
import { arrayMove } from '@dnd-kit/sortable';

export const useBoardStore = create((set) => ({
  boardData: null,
  loading: true,

  fetchBoard: async (boardId) => {
    try {
      set({ loading: true });
      const response = await api.get(`/boards/${boardId}`);
      const data = response.data.data;
      set({ boardData: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch board data:', error);
      set({ loading: false, boardData: null });
    }
  },

  updateTask: (updatedTask) => {
    set((state) => {
      if (!state.boardData) return state;
      return {
        boardData: {
          ...state.boardData,
          tasks: state.boardData.tasks.map((task) =>
            task._id === updatedTask._id ? { ...task, ...updatedTask } : task
          ),
        },
      };
    });
  },

  addTask: (newTask) => {
    set((state) => {
      if (!state.boardData) return state;

      const taskExists = state.boardData.tasks.some(
        (task) => task._id === newTask._id
      );

      if (taskExists) {
        console.log(`Tugas ${newTask._id} sudah ada. Penambahan dibatalkan.`);
        return state;
      }

      const todoColumn = state.boardData.columns.find(
        (col) => col.title === 'To Do'
      );
      if (!todoColumn) {
        console.error("Could not find the 'To Do' column.");
        return state;
      }
      const newColumns = state.boardData.columns.map((col) =>
        col._id === todoColumn._id
          ? { ...col, taskIds: [...col.taskIds, newTask._id] }
          : col
      );

      return {
        boardData: {
          ...state.boardData,
          tasks: [...state.boardData.tasks, newTask],
          columns: newColumns,
        },
      };
    });
  },

  removeTask: (taskId) => {
    set((state) => {
      if (!state.boardData) return state;
      const newColumns = state.boardData.columns.map((col) => ({
        ...col,
        taskIds: col.taskIds.filter((id) => id !== taskId),
      }));
      const newTasks = state.boardData.tasks.filter(
        (task) => task._id !== taskId
      );
      return {
        boardData: {
          ...state.boardData,
          tasks: newTasks,
          columns: newColumns,
        },
      };
    });
  },

  moveCard: (taskId, sourceColumnId, destColumnId) => {
    set((state) => {
      if (!state.boardData) return state;
      const newColumns = state.boardData.columns.map((col) => {
        if (col._id === sourceColumnId) {
          return {
            ...col,
            taskIds: col.taskIds.filter((id) => id !== taskId),
          };
        }
        if (col._id === destColumnId) {
          return {
            ...col,
            taskIds: [...col.taskIds, taskId],
          };
        }
        return col;
      });
      return {
        boardData: {
          ...state.boardData,
          columns: newColumns,
        },
      };
    });
  },

  reorderCardInColumn: (columnId, oldIndex, newIndex) => {
    set((state) => {
      if (!state.boardData) return state;

      const newColumns = state.boardData.columns.map((col) => {
        if (col._id === columnId) {
          return {
            ...col,
            taskIds: arrayMove(col.taskIds, oldIndex, newIndex),
          };
        }
        return col;
      });

      return {
        boardData: {
          ...state.boardData,
          columns: newColumns,
        },
      };
    });
  },

  setColumnTaskIds: (columnId, taskIds) => {
    set((state) => {
      if (!state.boardData) return state;
      const newColumns = state.boardData.columns.map((col) =>
        col._id === columnId ? { ...col, taskIds: taskIds } : col
      );
      return {
        boardData: {
          ...state.boardData,
          columns: newColumns,
        },
      };
    });
  },
}));
