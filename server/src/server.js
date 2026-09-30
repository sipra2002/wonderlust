const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { PORT, CLIENT_URL } = require('./config/env');
const setupChatSocket = require('./sockets/chatSocket');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupChatSocket(io);

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Wanderlust Server running on port ${PORT}`);
  console.log(`📡 REST API: http://localhost:${PORT}/api/v1/health`);
  console.log(`💬 Socket.io real-time chat active`);
  console.log(`=========================================`);
});
