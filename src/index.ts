import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();

// Enable CORS for Express API
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'],
}));

const server = http.createServer(app);

// Set up Socket.IO with CORS options
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Allow all origins for WebSocket connections
    methods: ['GET', 'POST'],
  },
});

interface Player {
  id: string;
  x: number;
  y: number;
  direction: { x: number; y: number };
}

const players: Record<string, Player> = {};

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Add new player
  players[socket.id] = {
    id: socket.id,
    x: 250,
    y: 250,
    direction: { x: 0, y: 0 },
  };

  // Notify all clients of the new player
  io.emit('updatePlayers', players);

  // Listen for movement updates from the client
  socket.on('move', (data: { x: number; y: number; direction: { x: number; y: number } }) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].direction = data.direction;
      io.emit('updatePlayers', players);
    }
  });

  // Remove player on disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('updatePlayers', players);
  });
});

app.get('/', (req, res) => {
  res.send('Hello, WebSocket with Express and Socket.IO!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
