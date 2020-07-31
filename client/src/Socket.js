import io from "socket.io-client";
let socket;

export const initiateSocket = () => {
  socket = io("http://localhost:5000");
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const getDownloads = (cb) => {
  if (!socket) return true;
  socket.on("torrentDownloader", (msg) => {
    return cb(null, msg);
  });
};
