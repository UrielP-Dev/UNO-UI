import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import GameHeader from "../components/GamePage/GameHeader";
import PlayersList from "../components/GamePage/PlayersList";
import GameStatus from "../components/GamePage/GameStatus";
import GameControls from "../components/GamePage/GameControls";
import LoadingSpinner from "../components/GamePage/LoadingSpinner";
import ErrorMessage from "../components/GamePage/ErrorMessage";
import { useGameLogic } from "../components/GamePage/hooks/useGameLogic";

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);

  // Agregar esta línea para determinar si el jugador está en la sala
  const isPlayerInRoom = gameData?.players?.some(player => player._id === userId);
  const isHost = gameData?.creator === userId;

  // Conectar al socket y unirse a la sala
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.emit("join_room", { gameId });

    return () => {
      if (newSocket) {
        newSocket.emit("leave_room", { gameId });
        newSocket.disconnect();
      }
    };
  }, [gameId]);

  // Obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("http://localhost:3000/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      if (userData && userData._id) {
        setUserId(userData._id);
      } else {
        throw new Error("No se pudo obtener el ID de usuario");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
    }
  };

  // Obtener datos del juego
  const fetchGameData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/games/${gameId}`, {
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

  // Manejar eventos de Socket.IO
  useEffect(() => {
    if (!socket || !gameId) return;

    const handleGameUpdate = async () => {
      console.log("Actualizando datos del juego...");
      await fetchGameData();
    };

    // Escuchar eventos relacionados con el juego
    socket.on("player_joined", handleGameUpdate);
    socket.on("player_left", handleGameUpdate);
    socket.on("game_started", (data) => {
      if (data.gameId === gameId) {
        console.log("Game started:", data);
        setGameData((prevData) => ({
          ...prevData,
          state: "playing",
        }));
        navigate(`/uno-game/${gameId}`);
      }
    });

    return () => {
      socket.off("player_joined", handleGameUpdate);
      socket.off("player_left", handleGameUpdate);
      socket.off("game_started");
    };
  }, [socket, gameId, navigate]);

  // Inicializar datos
  useEffect(() => {
    const initializeData = async () => {
      await fetchUserData();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchGameData();
      // Notificar al servidor que este usuario se ha unido a la sala
      if (socket) {
        socket.emit("player_joined", { gameId, userId });
      }
    }
  }, [userId, gameId, socket]);

  const leaveGame = async () => {
    try {
      const response = await fetch(`http://localhost:3000/games/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ game_id: gameId }),
      });
      if (!response.ok) throw new Error("Failed to leave game");

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const startGame = async () => {
    try {
      const response = await fetch("http://localhost:3000/games/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ game_id: gameId }),
      });
      if (!response.ok) throw new Error("Failed to start game");
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  const handleBackToLobby = () => {
    navigate("/");
  };

  // Añadir console.log para depuración
  useEffect(() => {
    if (gameData) {
      console.log("Usuario actual ID:", userId);
      console.log("Creador del juego ID:", gameData.creator);
      console.log("¿Es host?:", userId === gameData.creator);
      console.log("Estado del juego:", gameData.state);
      console.log("Número de jugadores:", gameData.players.length);
      console.log("Todos listos:", gameData.players.every(p => p.ready || p._id === gameData.creator));
    }
  }, [gameData, userId]);

  // Agregar esta función para unirse al juego
  const joinGame = async () => {
    try {
      const response = await fetch('http://localhost:3000/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          game_id: gameId 
        }),
      });

      if (!response.ok) {
        throw new Error('Error al unirse al juego');
      }

      // Emitir evento al socket después de unirse exitosamente
      socket.emit('join_game', { 
        gameId,
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username')
      });

      // No necesitamos llamar a fetchGameData aquí porque el socket actualizará los datos
    } catch (error) {
      console.error('Error joining game:', error);
      setError(error.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onBack={() => navigate("/")} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <GameHeader 
            gameName={gameData?.name} 
            gameId={gameId} 
            gameState={gameData?.state} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PlayersList 
              players={gameData?.players || []} 
              creator={gameData?.creator} 
            />
            
            <GameStatus 
              gameData={gameData}
              isHost={isHost}
              socket={socket}
              onStartGame={startGame}
            />
          </div>

          <GameControls 
            gameState={gameData?.state}
            isHost={isHost}
            isPlayerInRoom={isPlayerInRoom}
            onJoinGame={joinGame}
            onLeaveGame={leaveGame}
            onStartGame={startGame}
            onBackToLobby={handleBackToLobby}
            playersCount={gameData?.players?.length}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePage;