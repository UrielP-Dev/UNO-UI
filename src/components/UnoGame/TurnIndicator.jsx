import { useState, useEffect } from 'react';

const TurnIndicator = ({ isMyTurn, currentTurn, error }) => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowError(true);
      
      // Ocultar el error después de 3 segundos
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {showError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-lg mx-auto max-w-2xl mt-4 flex justify-between items-center">
          <div>
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
            <p className="text-sm italic mt-1">Try drawing a card instead</p>
          </div>
          <button 
            onClick={() => setShowError(false)}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
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