import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export const useGameLogic = (gameId, navigate) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);

  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        navigate('/login');
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      if (userData && userData._id) {
        setUserId(userData._id);
      } else {
        navigate('/login');
        throw new Error("No se pudo obtener el ID de usuario");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      navigate('/login');
    }
  };

  // Función para obtener datos del juego
  const fetchGameData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/games/${gameId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch game data");

      const result = await response.json();
      if (result.success) {
        setGameData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch game data");
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Efectos y lógica del socket
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL);
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leave_room", { gameId });
        newSocket.disconnect();
      }
    };
  }, [gameId]);

  // ... resto de los efectos y funciones de lógica del juego ...

  return {
    gameData,
    loading,
    error,
    userId,
    socket,
    fetchGameData,
    fetchUserData,
    // ... otras funciones necesarias
  };
}; 