import PropTypes from 'prop-types';

const GameControls = ({
  gameState,
  isHost,
  isPlayerInRoom,
  onJoinGame,
  onLeaveGame,
  onStartGame,
  onBackToLobby,
  playersCount
}) => {
  return (
    <div className="mt-8 flex flex-wrap gap-4 justify-center">
      {!isPlayerInRoom && gameState === "waiting" && (
        <Button
          onClick={onJoinGame}
          disabled={playersCount >= 6}
          variant="primary"
        >
          Join Game
        </Button>
      )}

      {isPlayerInRoom && (
        <Button onClick={onLeaveGame} variant="danger">
          Leave Game
        </Button>
      )}

      {isHost && gameState === "waiting" && (
        <Button
          onClick={onStartGame}
          disabled={playersCount < 2}
          variant="success"
        >
          Start Game
        </Button>
      )}

      <Button onClick={onBackToLobby} variant="secondary">
        Back to Lobby
      </Button>
    </div>
  );
};

const Button = ({ children, onClick, disabled, variant }) => {
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-2 rounded-lg font-medium transition-colors
        ${variants[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );
};

GameControls.propTypes = {
  gameState: PropTypes.string.isRequired,
  isHost: PropTypes.bool.isRequired,
  isPlayerInRoom: PropTypes.bool.isRequired,
  onJoinGame: PropTypes.func.isRequired,
  onLeaveGame: PropTypes.func.isRequired,
  onStartGame: PropTypes.func.isRequired,
  onBackToLobby: PropTypes.func.isRequired,
  playersCount: PropTypes.number.isRequired
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']).isRequired
};

Button.defaultProps = {
  disabled: false
};

export default GameControls; 