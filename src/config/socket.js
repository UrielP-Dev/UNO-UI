// src/configsocket.js
import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(URL, {
  path: '/socket.io', // Debe coincidir con la configuración del backend
  transports: ['websocket', 'polling']
});

export default socket;
