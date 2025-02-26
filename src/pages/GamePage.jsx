import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      
      const response = await fetch("http://localhost:3000/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await response.json();
      if (userData && userData._id) {
        setUserId(userData._id);
        console.log("ID de usuario obtenido:", userData._id);
      } else {
        throw new Error("No se pudo obtener el ID de usuario");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
    }
  };

  const fetchGameData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch game data");
      }

      const result = await response.json();
      console.log(result.data.creator);
      console.log(userId);
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

  useEffect(() => {
    const initializeData = async () => {
      await fetchUserData(); // Esperamos que termine antes de continuar
    };
  
    initializeData();
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchGameData();
      const interval = setInterval(fetchGameData, 5000); // Polling cada 5s
      return () => clearInterval(interval);
    }
  }, [gameId, userId]); // Se ejecutará cuando `userId` cambie
  

  const leaveGame = async () => {
    try {
      const response = await fetch(`http://localhost:3000/games/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: gameId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to leave game");
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  


  const startGame = async () => {

  console.log("Intentando iniciar el juego..."); // Depuración
    try {
  
      const response = await fetch("http://localhost:3000/games/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ game_id: gameId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to start game");
      }
  
      console.log("Redirigiendo a /uno-game/", gameId);
      navigate(`/uno-game/${gameId}`);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };
  

  const handleBackToLobby = () => {
    navigate("/");
  };

  const isHost = gameData && gameData.creator === userId;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-14 w-14 border-t-3 border-b-3 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-md w-full">
          <p className="text-red-600 text-center font-medium mb-6">
            Error: {error}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          {/* Sección de Cabecera */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-amber-100 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-800 mb-2">
                {gameData?.name}
              </h1>
              <p className="text-amber-600">Game ID: {gameId}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  gameData?.state === "waiting"
                    ? "bg-amber-100 text-amber-800"
                    : gameData?.state === "playing"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {gameData?.state === "waiting"
                  ? "Waiting for Players"
                  : gameData?.state === "playing"
                  ? "Game in Progress"
                  : "Game Ended"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sección de Jugadores */}
            <div className="lg:col-span-2">
              <div className="bg-amber-50 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold text-amber-800 mb-6 border-b border-amber-200 pb-3">
                  Players ({gameData?.players.length}/6)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameData?.players.map((player) => (
                    <div
                      key={player._id}
                      className={`flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border-l-4 ${
                        player._id === gameData.creator
                          ? "border-amber-400"
                          : player.ready
                          ? "border-green-400"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white
                          ${
                            player._id === gameData.creator
                              ? "bg-amber-500"
                              : player.ready
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {player.username[0].toUpperCase()}
                        </div>
                        <div>
                          
                          <span className="font-medium text-amber-900 block">
                            {player.username}
                          </span>
                          <div className="flex gap-2 mt-1">
                            {player._id === gameData.creator && (
                              <span className="text-xs bg-amber-200 px-2 py-0.5 rounded-full">
                                Host
                              </span>
                            )}
                            {player.ready && player._id !== gameData.creator && (
                              <span className="text-xs bg-green-200 px-2 py-0.5 rounded-full">
                                Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      
                    </div>
                  ))}
                </div>

                {gameData?.players.length === 0 && (
                  <div className="bg-white rounded-lg p-6 text-center">
                    <p className="text-amber-700">
                      Waiting for players to join the game...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Estado del Juego */}
            <div className="lg:col-span-1">
              <div className="bg-amber-50 rounded-xl p-6 shadow-md h-full">
                <h2 className="text-xl font-semibold text-amber-800 mb-6 border-b border-amber-200 pb-3">
                  Game Status
                  {isHost && <span className="ml-2 text-sm bg-green-200 px-2 py-0.5 rounded-full">Eres el Host</span>}
                </h2>
                
                {/* Para depuración - quitar en producción */}
                <div className="bg-gray-100 p-2 mb-4 rounded text-xs">
                  <p>Host: {isHost ? "Sí" : "No"}</p>
                  <p>Estado: {gameData?.state}</p>
                  <p>Jugadores: {gameData?.players.length}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-amber-600 mb-1">Status</p>
                    <p className="font-medium text-amber-900">
                      {gameData?.state === "waiting"
                        ? "Waiting for Players"
                        : gameData?.state === "playing"
                        ? "Game in Progress"
                        : "Game Ended"}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-amber-600 mb-1">Players</p>
                    <p className="font-medium text-amber-900">
                      {gameData?.players.length}/6
                    </p>
                  </div>

                  {gameData?.state === "playing" && (
                    <>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-amber-600 mb-1">
                          Current Card
                        </p>
                        <p className="font-medium text-amber-900">
                          {gameData?.currentCard?.color}{" "}
                          {gameData?.currentCard?.value}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-amber-600 mb-1">Direction</p>
                        <p className="font-medium text-amber-900">
                          {gameData?.direction === 1
                            ? "Clockwise"
                            : "Counter-clockwise"}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {/* Botón para iniciar juego (solo visible para el host) */}
                  {isHost && gameData?.state === "waiting" && (
                    <div className="mt-6">
                      <button
                        onClick={startGame}
                        className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium shadow-md"
                        disabled={gameData?.players.length < 2}
                      >
                        Iniciar Juego
                      </button>
                      {gameData?.players.length < 2 && (
                        <p className="text-xs text-amber-600 mt-2 text-center">Se necesitan al menos 2 jugadores para iniciar</p>
                      )}
                      {gameData?.players.length >= 2 && !gameData?.players.every(p => p.ready || p._id === userId) && (
                        <p className="text-xs text-amber-600 mt-2 text-center">Todos los jugadores deben estar listos</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-amber-100 pt-6">
            <button
              onClick={handleBackToLobby}
              className="px-4 py-2 text-amber-600 hover:text-amber-700 font-medium flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Lobby
            </button>

            {/* Sólo se deja el botón para abandonar el juego */}
            {gameData?.state === "waiting" && (
              <button
                onClick={leaveGame}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors duration-200 shadow-md"
              >
                Leave Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
