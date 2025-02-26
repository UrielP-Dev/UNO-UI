import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const UnoGame = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState({
    topCard: null,
    hand: [],
    currentTurn: null,
    playersInfo: [],
    isMyTurn: false,
    selectedCardIndex: null,
    gameStarted: false,
    message: '',
    loading: true,
    error: '',
    selectedColor: null,
    showColorPicker: false,
    lastPlayedCard: null,
    animation: {
      active: false,
      type: '',
      card: null,
    }
  });

  // Obtener token
  const getToken = () => localStorage.getItem('token');

  // Inicializar el juego
  useEffect(() => {
    const initializeGame = async () => {
      try {
        await dealCards();
        await getTopCard();
        await getUserHand();
        setGame(prev => ({ ...prev, gameStarted: true, loading: false }));
      } catch (error) {
        setGame(prev => ({ 
          ...prev, 
          error: 'Error al inicializar el juego: ' + error.message,
          loading: false 
        }));
      }
    };

    if (gameId) {
      initializeGame();
    }
  }, [gameId]);

  // Repartir cartas
  const dealCards = async () => {
    try {
      const response = await fetch('http://localhost:3000/games/deal-cards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId,
          cardsPerPlayer: 7
        })
      });
      
      if (!response.ok) throw new Error('Error al repartir cartas');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al repartir cartas:', error);
      throw error;
    }
  };

  // Obtener la carta superior
  const getTopCard = async () => {
    try {
      const response = await fetch('http://localhost:3000/games/top-card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId
        })
      });
      
      if (!response.ok) throw new Error('Error al obtener carta superior');
      
      const data = await response.json();
      setGame(prev => ({ 
        ...prev, 
        topCard: data.top_card,
        lastPlayedCard: data.top_card
      }));
      return data;
    } catch (error) {
      console.error('Error al obtener carta superior:', error);
      throw error;
    }
  };

  // Obtener mano del usuario
  const getUserHand = async () => {
    try {
      const response = await fetch('http://localhost:3000/hand', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId
        })
      });
      
      if (!response.ok) throw new Error('Error al obtener mano');
      
      const data = await response.json();
      if (data.success) {
        setGame(prev => ({ ...prev, hand: data.hand }));
      }
      return data;
    } catch (error) {
      console.error('Error al obtener mano:', error);
      throw error;
    }
  };

  // Jugar una carta
  const playCard = async (card) => {
    if (!game.isMyTurn) {
      setGame(prev => ({ ...prev, message: 'No es tu turno' }));
      return;
    }

    try {
      // Si es un wild card, mostrar selector de color primero
      if (card.type === 'wild' || card.type === 'wild_draw4') {
        setGame(prev => ({ 
          ...prev, 
          selectedCardIndex: game.hand.findIndex(c => c._id === card._id),
          showColorPicker: true 
        }));
        return;
      }

      setGame(prev => ({ 
        ...prev, 
        loading: true,
        animation: {
          active: true,
          type: 'play',
          card: card
        }
      }));

      const response = await fetch('http://localhost:3000/game-rules/play-card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId,
          cardPlayed: card
        })
      });
      
      if (!response.ok) throw new Error('Jugada no válida');
      
      const data = await response.json();
      
      // Eliminar la carta jugada de la mano
      const updatedHand = game.hand.filter(c => c._id !== card._id);
      
      setGame(prev => ({ 
        ...prev, 
        hand: updatedHand,
        lastPlayedCard: card,
        topCard: card,
        isMyTurn: false,
        currentTurn: data.nextPlayer,
        message: `Es el turno de ${data.nextPlayer.username}`,
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
      
      return data;
    } catch (error) {
      console.error('Error al jugar carta:', error);
      setGame(prev => ({ 
        ...prev, 
        error: 'Error al jugar carta: ' + error.message,
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
    }
  };

  // Función para seleccionar el color cuando se juega una wild card
  const selectColor = async (color) => {
    if (game.selectedCardIndex === null || !game.hand[game.selectedCardIndex]) {
      setGame(prev => ({ 
        ...prev, 
        showColorPicker: false,
        error: 'Error al seleccionar color: Carta no válida'
      }));
      return;
    }

    const card = { ...game.hand[game.selectedCardIndex], color };

    try {
      setGame(prev => ({ 
        ...prev,
        showColorPicker: false,
        loading: true,
        animation: {
          active: true,
          type: 'play',
          card: card
        }
      }));

      const response = await fetch('http://localhost:3000/game-rules/play-card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId,
          cardPlayed: card
        })
      });
      
      if (!response.ok) throw new Error('Jugada no válida');
      
      const data = await response.json();
      
      // Eliminar la carta jugada de la mano
      const updatedHand = game.hand.filter(c => c._id !== card._id);
      
      setGame(prev => ({ 
        ...prev, 
        hand: updatedHand,
        lastPlayedCard: card,
        topCard: card,
        isMyTurn: false,
        currentTurn: data.nextPlayer,
        message: `Es el turno de ${data.nextPlayer.username}`,
        selectedCardIndex: null,
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
    } catch (error) {
      console.error('Error al jugar wild card:', error);
      setGame(prev => ({ 
        ...prev, 
        error: 'Error al jugar wild card: ' + error.message,
        loading: false,
        selectedCardIndex: null,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
    }
  };

  // Robar una carta
  const drawCard = async () => {
    if (!game.isMyTurn) {
      setGame(prev => ({ ...prev, message: 'No es tu turno' }));
      return;
    }

    try {
      setGame(prev => ({ 
        ...prev, 
        loading: true,
        animation: {
          active: true,
          type: 'draw',
          card: null
        }
      }));

      const response = await fetch('http://localhost:3000/game-rules/draw-card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId
        })
      });
      
      if (!response.ok) throw new Error('Error al robar carta');
      
      const data = await response.json();
      
      // Añadir la nueva carta a la mano
      await getUserHand();
      
      setGame(prev => ({ 
        ...prev, 
        isMyTurn: false, // Asumimos que el turno pasa al siguiente jugador
        message: 'Carta robada',
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
      
      return data;
    } catch (error) {
      console.error('Error al robar carta:', error);
      setGame(prev => ({ 
        ...prev, 
        error: 'Error al robar carta: ' + error.message,
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
    }
  };

  // Función para renderizar una carta
  const renderCard = (card, index, isTopCard = false, isHandCard = false) => {
    if (!card) return null;
    
    const baseClasses = `relative rounded-lg shadow-md transition-all transform ${isHandCard ? 'cursor-pointer hover:-translate-y-3' : ''}`;
    const sizeClasses = isTopCard ? 'w-24 h-36' : 'w-20 h-32';
    
    let backgroundColor;
    switch (card.color) {
      case 'red': backgroundColor = 'bg-red-600'; break;
      case 'blue': backgroundColor = 'bg-blue-600'; break;
      case 'green': backgroundColor = 'bg-green-600'; break;
      case 'yellow': backgroundColor = 'bg-yellow-500'; break;
      default: backgroundColor = 'bg-gray-800'; // Para wild cards
    }
    
    const isSelected = isHandCard && index === game.selectedCardIndex;
    const selectedClass = isSelected ? 'ring-4 ring-yellow-400 -translate-y-4' : '';
    
    return (
      <div 
        className={`${baseClasses} ${sizeClasses} ${backgroundColor} ${selectedClass}`}
        onClick={() => isHandCard && playCard(card)}
      >
        <div className="absolute inset-1 bg-white/10 rounded">
          <div className="flex h-full items-center justify-center text-white font-bold text-xl">
            {card.type === 'number' ? card.value : card.type}
          </div>
        </div>
      </div>
    );
  };

  // Renderizado del selector de color
  const renderColorPicker = () => {
    if (!game.showColorPicker) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Selecciona un color</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => selectColor('red')}
              className="w-24 h-24 bg-red-600 rounded-lg hover:ring-4 hover:ring-yellow-400"
            ></button>
            <button 
              onClick={() => selectColor('blue')}
              className="w-24 h-24 bg-blue-600 rounded-lg hover:ring-4 hover:ring-yellow-400"
            ></button>
            <button 
              onClick={() => selectColor('green')}
              className="w-24 h-24 bg-green-600 rounded-lg hover:ring-4 hover:ring-yellow-400"
            ></button>
            <button 
              onClick={() => selectColor('yellow')}
              className="w-24 h-24 bg-yellow-500 rounded-lg hover:ring-4 hover:ring-yellow-400"
            ></button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado de animaciones
  const renderAnimation = () => {
    if (!game.animation.active) return null;
    
    if (game.animation.type === 'play') {
      return (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
            {game.animation.card && renderCard(game.animation.card)}
          </div>
        </div>
      );
    }
    
    if (game.animation.type === 'draw') {
      return (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 animate-pulse">
            <div className="w-20 h-32 bg-indigo-600 rounded-lg shadow-md"></div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Renderizado principal del componente
  if (game.loading && !game.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-indigo-600 animate-pulse">Cargando el juego...</div>
      </div>
    );
  }

  if (game.error && !game.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{game.error}</p>
          <button 
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      {/* Animaciones */}
      {renderAnimation()}
      
      {/* Selector de color */}
      {renderColorPicker()}
      
      {/* Mensajes */}
      {(game.message || game.error) && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 ${
          game.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          <p className="font-medium">{game.error || game.message}</p>
        </div>
      )}
      
      {/* Mesa de juego */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Cabecera */}
        <div className="bg-indigo-600 p-4 text-white">
          <h1 className="text-2xl font-bold">UNO Game</h1>
          <p>ID: {gameId}</p>
        </div>
        
        {/* Área de juego */}
        <div className="p-6">
          {/* Información del juego */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Turno: {game.isMyTurn ? 'Tu turno' : (game.currentTurn ? game.currentTurn.username : 'Esperando...')}</h2>
            </div>
            <div>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={() => drawCard()}
                disabled={!game.isMyTurn}
              >
                Robar carta
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
                {renderCard(game.topCard, null, true)}
                <div className="absolute -bottom-6 left-0 right-0 text-center text-sm font-medium text-gray-600">
                  Carta actual
                </div>
              </div>
            )}
          </div>
          
          {/* Mano del jugador */}
          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tu mano</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {game.hand.map((card, index) => (
                <div key={card._id || index} className="transition-transform">
                  {renderCard(card, index, false, true)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnoGame;