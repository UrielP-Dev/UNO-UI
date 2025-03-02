const GameHeader = ({ gameName, gameId, gameState }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-amber-100 pb-6">
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-2">{gameName}</h1>
      <p className="text-amber-600">Game ID: {gameId}</p>
    </div>
    <div className="flex items-center gap-3">
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          gameState === "waiting"
            ? "bg-amber-100 text-amber-800"
            : gameState === "playing"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {gameState === "waiting"
          ? "Waiting for Players"
          : gameState === "playing"
          ? "Game in Progress"
          : "Game Ended"}
      </span>
    </div>
  </div>
);

export default GameHeader; 