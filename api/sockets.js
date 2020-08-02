let io;

const initSocket = (server) => {
  io = server;
};

const emmitToFront = (data) => io.emit("torrentDownloader", data);

module.exports = {
  initSocket,
  emmitToFront,
};
