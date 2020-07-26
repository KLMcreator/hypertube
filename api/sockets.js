let io;

const initSocket = (server) => {
  io = server;
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });
};

const emmitToFront = (data) => io.emit("torrentDownloader", data);

module.exports = {
  initSocket,
  emmitToFront,
};
