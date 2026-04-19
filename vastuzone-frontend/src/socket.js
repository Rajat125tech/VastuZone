import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: false, 
});
