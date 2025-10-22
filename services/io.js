let _sendToUser = (userId, payload) => false;
let _broadcastToRole = (role, payload) => 0;

function setSendToUser(fn) {
  _sendToUser = fn;
}

function setBroadcastToRole(fn) {
  _broadcastToRole = fn;
}

function sendToUser(userId, payload) {
  return _sendToUser(userId, payload);
}

function broadcastToRole(role, payload) {
  return _broadcastToRole(role, payload);
}

module.exports = { setSendToUser, setBroadcastToRole, sendToUser, broadcastToRole };
