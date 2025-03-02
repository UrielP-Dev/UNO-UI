import PropTypes from 'prop-types';

const GameStatus = ({ gameData, isHost, onStartGame }) => {
  const allPlayersReady = gameData?.players?.every(p => p.ready || p._id === gameData?.creator);
  const hasEnoughPlayers = gameData?.players?.length >= 2;
  const canStartGame = isHost && allPlayersReady && hasEnoughPlayers;

  return (
    <div className="lg:col-span-1">
      <div className="bg-amber-50 rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold text-amber-800 mb-6 border-b border-amber-200 pb-3">
          Game Status
        </h2>
        <div className="space-y-4">
          <StatusItem
            label="Players Ready"
            value={`${gameData?.players?.filter(p => p.ready || p._id === gameData?.creator).length}/${gameData?.players?.length}`}
            isReady={allPlayersReady}
          />
          <StatusItem
            label="Minimum Players"
            value={`${gameData?.players?.length}/2`}
            isReady={hasEnoughPlayers}
          />
          {isHost && (
            <button
              onClick={onStartGame}
              disabled={!canStartGame}
              className={`w-full py-3 px-6 rounded-lg font-medium ${
                canStartGame
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusItem = ({ label, value, isReady }) => (
  <div className="flex items-center justify-between">
    <span className="text-amber-700">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-amber-900 font-medium">{value}</span>
      <span className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`}></span>
    </div>
  </div>
);

GameStatus.propTypes = {
  gameData: PropTypes.shape({
    players: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      ready: PropTypes.bool
    })),
    creator: PropTypes.string
  }),
  isHost: PropTypes.bool.isRequired,
  onStartGame: PropTypes.func.isRequired
};

StatusItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isReady: PropTypes.bool.isRequired
};

export default GameStatus; 