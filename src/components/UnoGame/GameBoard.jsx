import Card from './Card';
import PlayerHand from './PlayerHand';

const GameBoard = ({ 
  game, 
  onPlayCard, 
  onDrawCard, 
  onSayUno 
}) => {
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden mt-20">
      {/* Cabecera */}
      <div className="bg-indigo-600 p-4 text-white">
        <h1 className="text-2xl font-bold">UNO Game</h1>
        <p>ID: {game.gameId}</p>
      </div>
      
      {/* Área de juego */}
      <div className="p-6">
        {/* Información del juego */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button 
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                game.isMyTurn
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-600'
              }`}
              onClick={onDrawCard}
              disabled={!game.isMyTurn}
            >
              Robar carta
            </button>
          </div>
          <div>
            <button
              className={`px-6 py-3 rounded-lg font-bold transition-all 
                ${game.hand.length === 1 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              onClick={onSayUno}
            >
              ¡UNO!
            </button>
          </div>
        </div>
        
        {/* Cartas en mesa */}
        <div className="bg-indigo-100 rounded-xl p-8 mb-8 flex items-center justify-center space-x-8">
          {/* Mazo */}
          <div className="w-24 h-36 bg-indigo-600 rounded-lg shadow-md flex items-center justify-center text-white font-bold">
            UNO
          </div>
          
          {/* Carta actual */}
          {game.topCard && (
            <div className="relative">
              <Card card={game.topCard} isTopCard={true} />
              <div className="absolute -bottom-6 left-0 right-0 text-center text-sm font-medium text-gray-600">
                Carta actual
              </div>
            </div>
          )}
        </div>
        
        {/* Mano del jugador */}
        <PlayerHand 
          hand={game.hand} 
          onPlayCard={onPlayCard} 
          selectedCardIndex={game.selectedCardIndex} 
        />
      </div>
    </div>
  );
};

export default GameBoard; 