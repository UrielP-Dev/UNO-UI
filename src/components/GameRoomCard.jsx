import { Users, Crown, Cat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GameRoomCard = ({ room }) => {
  const navigate = useNavigate();
  const players = room.players || [];

  return (
    <div 
      onClick={() => navigate(`/game/${room._id}`)}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-amber-100 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02] h-[250px] flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-sm text-amber-800">{room.name}</h3>
          <span
            className={`px-2 py-0.5 ${
              room.state === 'waiting' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            } text-xs rounded-full`}
          >
            {room.state === 'waiting' ? 'Waiting' : 'In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-amber-700 mb-2 text-xs">
          <Users className="w-3 h-3" />
          <span>{players.length}/6 players</span>
        </div>

        <div className="mb-3">
          <h4 className="font-medium text-xs text-amber-800 mb-1">Players:</h4>
          <div className="space-y-1 max-h-[100px] overflow-y-auto">
            {players.map((player, index) => (
              <div key={player._id || index} className="flex items-center gap-2">
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
    </div>
  );
};

export default GameRoomCard;