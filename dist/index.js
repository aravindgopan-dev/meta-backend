"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const players = {};
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
    socket.on('move', (data) => {
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
