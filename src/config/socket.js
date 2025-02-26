// src/configsocket.js
import { io } from 'socket.io-client';

const URL = 'http://localhost:3000'; // Asegúrate de que coincide con la URL de tu backend
const socket = io(URL, {
  path: '/socket.io', // Debe coincidir con la configuración del backend
  transports: ['websocket', 'polling']
});

export default socket;
