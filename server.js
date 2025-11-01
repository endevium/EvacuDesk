require("dotenv").config();
const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const ioService = require("./services/io");

const PORT = process.env.PORT;

const server = http.createServer(app);

// init socket io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});

// Initialize io in ioService (for use anywhere in the app)
ioService.init(io);

// targeted notification
const activeUsers = new Map();

// socket connection
io.on("connection", (socket) => {
  console.log("client connected:", socket.id);

  // register user and roles
  socket.on("register", (payload) => {
    try {
      let userId = null;
      let role = null;

      if (!payload) return;
      if (typeof payload === "string") {
        userId = payload;
      } else if (typeof payload === "object") {
        userId = payload.userId || null;
        role = payload.role || null;
      }

      if (userId) {
        activeUsers.set(userId.toString(), { socketId: socket.id, role });
        console.log(`✅ Registered user: ${userId} (${role || "no role"})`);
      }
    } catch (err) {
      console.error("⚠️ register handler error:", err.message || err);
    }
  });

  // disconnect user from socket
  socket.on("disconnect", () => {
    for (let [userId, info] of activeUsers) {
      if (info.socketId === socket.id) {
        activeUsers.delete(userId);
      }
    }
  });
});

// send notification to single user (if connected)
function _sendToUser(userId, payload) {
  if (!userId) return false;
  const info = activeUsers.get(userId.toString());
  if (info && info.socketId) {
    io.to(info.socketId).emit("notification", payload);
    return true;
  }
  return false;
}

// broadcast notification to all users with a given role
function _broadcastToRole(role, payload) {
  if (!role) return 0;
  let count = 0;
  for (let [userId, info] of activeUsers) {
    if (info.role === role && info.socketId) {
      io.to(info.socketId).emit("notification", payload);
      count++;
    }
  }
  return count;
}

// io helper function
ioService.setSendToUser(_sendToUser);
ioService.setBroadcastToRole(_broadcastToRole);

// socket to all request
app.use((req, res, next) => {
  req.io = ioService.getIO();
  next();
});

if (require.main === module) {
  server.listen(PORT, () => {
  });
}

module.exports = { io };
