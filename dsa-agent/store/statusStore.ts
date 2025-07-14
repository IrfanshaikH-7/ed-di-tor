import { create } from 'zustand';
// @ts-ignore
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface StatusStore {
  status: string;
  setStatus: (status: string) => void;
  socket: Socket | null;
}

export const useStatusStore = create<StatusStore>((set) => {
  let socket: Socket | null = null;

  if (typeof window !== 'undefined') {
    socket = io('ws://localhost:8082');
    socket.on('status', (data: { status: string }) => {
      console.log('Socket status:', data.status);
      set({ status: data.status });
    });
  }

  return {
    status: 'idle',
    setStatus: (status: string) => set({ status }),
    socket,
  };
}); 