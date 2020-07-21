const socketio = require("socket.io");

module.exports.listen = (app) => {
  io = socketio.listen(app);
  exports.sockets = io.sockets;

  const isOpen = (ws) => ws.readyState === ws.OPEN;

  io.sockets.on("connection", (socket) => {
    if (socket.connected && isOpen(socket)) {
      socket.on("disconnect", () => {
        //   console.log("socket", socket.id, "disconnected");
      });
    }
  });

  return io;
};
