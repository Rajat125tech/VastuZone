import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001"; // Hardcoded to local for testing

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: false, 
});
