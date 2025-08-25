// src/components/MenteeDashboard.js
'use client';
import { useState } from 'react';
import TaskItem from './TaskItem';
import AiTutorModal from './AiTutorModal';

export default function MenteeDashboard({ tasks, onTaskUpdate, userId }) {
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

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-700">Tugas Anda</h2>
      {tasks.length > 0 ? (
        <div className="mt-4 space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="border rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <TaskItem
                task={task}
                onTaskUpdate={onTaskUpdate}
                onAskAI={handleAskAI}
                currentUserId={userId}
                userRole="mentee"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-gray-500">Anda belum memiliki tugas.</p>
      )}

      {isAiModalOpen && selectedTaskForAI && (
        <AiTutorModal
          task={selectedTaskForAI}
          isOpen={isAiModalOpen}
          onClose={handleCloseAiModal}
          conversation={conversation}
          setConversation={setConversation}
        />
      )}
    </div>
  );
}
