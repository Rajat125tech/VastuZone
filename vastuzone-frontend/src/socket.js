import { io } from "socket.io-client";

const SOCKET_URL =
  "https://vastuzone-backend.onrender.com" || "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, 
});
