// src/lib/socket.js
import { io } from 'socket.io-client';

// URL of your backend
const URL =
  process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5001';

export const socket = io(URL, {
  autoConnect: false, // We'll connect manually when the user enters a board
});
