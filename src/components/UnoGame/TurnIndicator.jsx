const TurnIndicator = ({ isMyTurn, currentTurn, error }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-lg mx-auto max-w-2xl mt-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Indicador de Turno */}
      <div className={`text-center p-4 text-2xl font-bold transition-all duration-300 ${
        isMyTurn 
          ? 'bg-green-500 text-white animate-pulse' 
          : 'bg-gray-700 text-white'
      }`}>
        {isMyTurn 
          ? '¡ES TU TURNO!' 
          : `Turno de: ${currentTurn?.username || 'Esperando...'}`
        }
      </div>
    </div>
  );
};

export default TurnIndicator; 