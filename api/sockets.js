const socketio = require("socket.io");

module.exports.listen = (app) => {
  io = socketio.listen(app);
  exports.sockets = io.sockets;

  io.sockets.on("connection", (socket) => {
    exports.id = socket.id;
    socket.on("disconnect", () => {
      //   console.log("socket", socket.id, "disconnected");
    });
  });

  return io;
};
