import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGameData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/games/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch game data');
      }

      const result = await response.json();
      if (result.success) {
        setGameData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch game data');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
    // Implementar websocket para actualizaciones en tiempo real aquí
    const interval = setInterval(fetchGameData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [gameId]);

  const joinGame = async () => {
    try {
      const response = await fetch(`http://localhost:3000/games/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join game');
      }

      // Refetch game data after joining
      fetchGameData();
    } catch (err) {
      setError(err.message);
    }
  };

  const leaveGame = async () => {
    try {
      const response = await fetch(`http://localhost:3000/games/${gameId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to leave game');
      }

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-amber-800">
              Game Room: {gameData?.name}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm ${
              gameData?.state === 'waiting' ? 'bg-amber-100 text-amber-800' :
              gameData?.state === 'playing' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {gameData?.state}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Players Section */}
            <div className="bg-amber-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-amber-800 mb-4">Players</h2>
              <div className="space-y-3">
                {gameData?.players.map((player) => (
                  <div
                    key={player._id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${player._id === gameData.creator ? 'bg-amber-200' : 'bg-gray-200'}`}>
                        {player.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-amber-900">
                        {player.username}
                        {player._id === gameData.creator && (
                          <span className="ml-2 text-xs bg-amber-200 px-2 py-0.5 rounded-full">
                            Host
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Status Section */}
            <div className="bg-amber-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-amber-800 mb-4">Game Status</h2>
              <div className="space-y-2">
                <p className="text-amber-700">
                  Players: {gameData?.players.length}/6
                </p>
                <p className="text-amber-700">
                  Status: {gameData?.state}
                </p>
                {gameData?.state === 'playing' && (
                  <>
                    <p className="text-amber-700">
                      Current Card: {gameData?.currentCard?.color} {gameData?.currentCard?.value}
                    </p>
                    <p className="text-amber-700">
                      Direction: {gameData?.direction === 1 ? 'Clockwise' : 'Counter-clockwise'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-amber-600 hover:text-amber-700"
            >
              Back to Lobby
            </button>
            
            {gameData?.state === 'waiting' && !gameData?.players.some(p => p._id === localStorage.getItem('userId')) && (
              <button
                onClick={joinGame}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Join Game
              </button>
            )}
            
            {gameData?.state === 'waiting' && gameData?.players.some(p => p._id === localStorage.getItem('userId')) && (
              <button
                onClick={leaveGame}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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