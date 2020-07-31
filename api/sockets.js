let io;

const initSocket = (server) => {
  io = server;
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });
};

const emmitToFront = (data) => {
  if (data && io) {
    io.emit("torrentDownloader", data);
  }
};

module.exports = {
  initSocket,
  emmitToFront,
};
