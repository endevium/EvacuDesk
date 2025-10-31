const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const activeUsers = new Map();

// handle socket connections
io.on("connection", (socket) => {

  socket.on("register", (payload) => {
    try {
      let userId = null;
      let role = null;
      if (!payload) return;
      if (typeof payload === 'string') {
        userId = payload;
      } else if (typeof payload === 'object') {     
        userId = payload.userId || null;
        role = payload.role || null;
      }

      if (userId) {
        activeUsers.set(userId.toString(), { socketId: socket.id, role });
        console.log(`✅ Socket registered for user: ${userId} (role: ${role || "unknown"})`);
      }
    } catch (err) {
      console.error('register handler error:', err.message || err);
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, info] of activeUsers) {
      if (info.socketId === socket.id) activeUsers.delete(userId);
    }
  });
});

// send notification to a single user if connected
function _sendToUser(userId, payload) {
  if (!userId) return false;
  const info = activeUsers.get(userId.toString());
  if (info && info.socketId) {
    io.to(info.socketId).emit('notification', payload);
    return true;
  }
  return false;
}

// broadcast to all connected sockets that have registered with the given role
function _broadcastToRole(role, payload) {
  if (!role) return 0;
  let count = 0;
  for (let [userId, info] of activeUsers) {
    if (info.role && info.role === role && info.socketId) {
      io.to(info.socketId).emit('notification', payload);
      count++;
    }
  }
  return count;
}

// set the concrete implementations into services/io to avoid circular require issues
const ioService = require('./services/io');
ioService.setSendToUser(_sendToUser);
ioService.setBroadcastToRole(_broadcastToRole);

if (require.main === module) {
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = {
  io,
};
