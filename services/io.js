let ioInstance = null;
let _sendToUser = (userId, payload) => false;
let _broadcastToRole = (role, payload) => 0;

// set functions (these are called from server.js)
function setSendToUser(fn) {
  _sendToUser = fn;
}

function setBroadcastToRole(fn) {
  _broadcastToRole = fn;
}

// init io
function init(io) {
  ioInstance = io;
}

// getter to access io anywhere
function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized yet.");
  return ioInstance;
}

// wrappers
function sendToUser(userId, payload) {
  return _sendToUser(userId, payload);
}

function broadcastToRole(role, payload) {
  return _broadcastToRole(role, payload);
}

module.exports = {
  init,
  getIO,
  setSendToUser,
  setBroadcastToRole,
  sendToUser,
  broadcastToRole,
};
