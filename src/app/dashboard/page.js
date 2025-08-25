// src/app/dashboard/page.js
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; // <-- Import useState
import api from '@/lib/api';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // State to hold a message for the user
  const [statusMessage, setStatusMessage] = useState(
    'Finding your board, please wait...'
  );

  useEffect(() => {
    const findAndGoToBoard = async () => {
      try {
        const response = await api.get('/boards/my-board');
        const { boardId } = response.data;

        if (boardId) {
          router.push(`/boards/${boardId}`);
        } else {
          // This case is unlikely if the API returns 404, but good to have
          setStatusMessage('Could not find a board ID in the server response.');
        }
      } catch (error) {
        // Check if the error is specifically a 404
        if (error.response && error.response.status === 404) {
          console.error('No board found for this user.');
          // Set a user-friendly message for the mentee
          setStatusMessage(
            'You have not been assigned to a project board yet. Please contact your mentor.'
          );
        } else {
          console.error('Error finding a board for the user:', error);
          setStatusMessage(
            'An error occurred while trying to find your board.'
          );
        }
      }
    };

    if (!loading && user) {
      findAndGoToBoard();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  // Display the dynamic status message
  return (
    <div className="flex min-h-screen items-center justify-center p-4 text-center">
      <p>{statusMessage}</p>
    </div>
  );
}
