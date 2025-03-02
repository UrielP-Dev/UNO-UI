import PropTypes from 'prop-types';

const PlayersList = ({ players, creator }) => (
  <div className="lg:col-span-2">
    <div className="bg-amber-50 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-semibold text-amber-800 mb-6 border-b border-amber-200 pb-3">
        Players ({players.length}/6)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player) => (
          <PlayerCard key={player._id} player={player} isCreator={player._id === creator} />
        ))}
      </div>
      {players.length === 0 && (
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-amber-700">Waiting for players to join the game...</p>
        </div>
      )}
    </div>
  </div>
);

const PlayerCard = ({ player, isCreator }) => (
  <div
    className={`flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border-l-4 ${
      isCreator
        ? "border-amber-400"
        : player.ready
        ? "border-green-400"
        : "border-gray-200"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
        <span className="text-amber-800 font-medium">
          {player.username ? player.username[0].toUpperCase() : '?'}
        </span>
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{player.username}</h3>
        <p className="text-sm text-gray-500">
          {isCreator ? "Host" : player.ready ? "Ready" : "Not Ready"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {isCreator && (
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
          Host
        </span>
      )}
      {!isCreator && (
        <span
          className={`w-3 h-3 rounded-full ${
            player.ready ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      )}
    </div>
  </div>
);

PlayersList.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      ready: PropTypes.bool.isRequired
    })
  ).isRequired,
  creator: PropTypes.string.isRequired
};

PlayerCard.propTypes = {
  player: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired
  }).isRequired,
  isCreator: PropTypes.bool.isRequired
};

export default PlayersList; 