import io from "socket.io-client";

let socket;

export const initiateSocket = () => {
  socket = io("http://localhost:5000");
};

export const disconnectSocket = () => {
  console.log(`closing socket ${socket.io.readyState}`);
  if (
    socket &&
    socket.io.readyState &&
    socket.io.readyState.toLowerCase() !== "closing" &&
    socket.io.readyState.toLowerCase() !== "closed"
  )
    socket.disconnect();
};

export const getDownloads = (cb) => {
  if (!socket) return true;
  socket.on("torrentDownloader", (msg) => {
    return cb(null, msg);
  });
};
