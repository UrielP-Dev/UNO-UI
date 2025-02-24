import { Users, Crown, Cat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GameRoomCard = ({ room }) => {
  const navigate = useNavigate();
  const isHost = room.creator._id === localStorage.getItem('userId');
  
  const handleRoomAction = async (action) => {
    try {
      let endpoint = '';
      switch (action) {
        case 'join':
          endpoint = '/games/join';
          break;
        case 'leave':
          endpoint = '/games/leave';
          break;
        case 'start':
          endpoint = '/games/start';
          break;
        default:
          return;
      }

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ game_id: room._id })
      });

      const data = await response.json();
      console.log('Response:', data); // Para debugging

      if (response.ok) {
        if (action === 'join' || action === 'start') {
          console.log('Redirecting to:', `/game/${room._id}`); // Para debugging
          navigate(`/game/${room._id}`, { replace: true });
        }
      } else {
        throw new Error(data.message || `Failed to ${action} game`);
      }
    } catch (error) {
      console.error(`Error ${action}ing room:`, error);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-amber-100 shadow-md hover:shadow-lg transition-shadow h-[250px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-sm text-amber-800">{room.name}</h3>
          <span className={`px-2 py-0.5 ${
            room.state === 'waiting' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          } text-xs rounded-full`}>
            {room.state === 'waiting' ? 'Waiting' : 'In Progress'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-amber-700 mb-2 text-xs">
          <Users className="w-3 h-3" />
          <span>{room.players.length}/6 players</span>
        </div>

        <div className="mb-3">
          <h4 className="font-medium text-xs text-amber-800 mb-1">Players:</h4>
          <div className="space-y-1 max-h-[100px] overflow-y-auto">
            {room.players.map(player => (
              <div key={player._id} className="flex items-center gap-2">
                {player._id === room.creator._id ? (
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                    <Cat className="w-3 h-3 text-amber-700" />
                  </div>
                )}
                <span className="text-amber-700 text-xs">{player.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {room.state === 'waiting' && (
        <button 
          onClick={() => handleRoomAction(isHost ? 'start' : 'join')}
          disabled={isHost ? room.players.length < 2 : room.players.length >= 6}
          className={`w-full font-medium py-1.5 px-3 rounded-lg text-xs
            transform hover:scale-[1.02] transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isHost 
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-500' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white focus:ring-orange-500'
            }`}
        >
          {isHost 
            ? 'Start Game' 
            : room.players.some(p => p._id === localStorage.getItem('userId')) 
              ? 'Leave Room' 
              : 'Join Room'
          }
        </button>
      )}
    </div>
  );
};

export default GameRoomCard;