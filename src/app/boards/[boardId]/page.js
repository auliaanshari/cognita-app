// src/app/board/[boardId]/page.js
'use client';

import { useParams } from 'next/navigation';
import Board from '@/components/Board';

export default function BoardPage() {
  const params = useParams();
  const { boardId } = params;

  if (!boardId) {
    return <div>Loading Board...</div>;
  }

  return (
    <div>
      {/* Hanya render komponen Board utama */}
      <Board boardId={boardId} />
    </div>
  );
}
