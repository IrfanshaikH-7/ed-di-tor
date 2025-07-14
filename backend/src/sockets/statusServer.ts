import { Server } from 'socket.io';
import http from 'http';

let currentStatus = 'idle';
let idleTimeout: NodeJS.Timeout | null = null;

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  socket.emit('status', { status: currentStatus });
});

function broadcastStatus() {
  io.emit('status', { status: currentStatus });
}

export function setStatus(status: string) {
  currentStatus = status;
  broadcastStatus();
  if (status === 'done' || status === 'failed') {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      currentStatus = 'idle';
      broadcastStatus();
    }, 1000);
  }
}

export function getStatus() {
  return currentStatus;
}

httpServer.listen(8082, () => {
  console.log('Status Socket.IO server running on ws://localhost:8082');
});

