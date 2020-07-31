import io from "socket.io-client";
let socket;

export const initiateSocket = () => {
  if (!socket) socket = io("http://localhost:5000");
};

export const disconnectSocket = () => {
  if (socket && socket.connected) socket.disconnect();
};

export const getDownloads = (cb) => {
  if (!socket && !socket.connected) return true;
  socket.on("torrentDownloader", (msg) => {
    return cb(null, msg);
  });
};
