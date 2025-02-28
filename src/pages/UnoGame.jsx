import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

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
  const [socket, setSocket] = useState(null);

  // Obtener token
  const getToken = () => localStorage.getItem('token');

  // Inicializar socket
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Escuchar eventos del socket
  useEffect(() => {
    if (!socket) return;

    // Cuando se juega una carta
    socket.on('card_played', (data) => {
      if (data.gameId === gameId) {
        setGame(prev => ({
          ...prev,
          topCard: data.cardPlayed,
          lastPlayedCard: data.cardPlayed,
          currentTurn: {
            id: data.playerId,
            username: data.playerName || 'Jugador'
          },
          isMyTurn: data.playerId === localStorage.getItem('userId'),
          message: `${data.playerName || 'Jugador'} debe jugar`
        }));
      }
    });

    // Cuando alguien roba una carta
    socket.on('card_drawn', (data) => {
      if (data.gameId === gameId) {
        if (data.playerId === localStorage.getItem('userId')) {
          getUserHand(); // Actualizar la mano del jugador actual
        }
        setGame(prev => ({
          ...prev,
          currentTurn: {
            id: data.playerId,
            username: data.playerName || 'Jugador'
          },
          isMyTurn: data.playerId === localStorage.getItem('userId'),
          message: `${data.playerName || 'Jugador'} debe jugar`
        }));
      }
    });

    // Cuando se reparten las cartas iniciales
    socket.on('cards_dealt', (data) => {
      if (data.gameId === gameId) {
        getUserHand();
      }
    });

    // Cuando se revela la carta inicial
    socket.on('top_card_revealed', (data) => {
      if (data.gameId === gameId) {
        setGame(prev => ({
          ...prev,
          topCard: data.card,
          lastPlayedCard: data.card
        }));
      }
    });

    // Cuando alguien dice UNO
    socket.on('uno_called', (data) => {
      if (data.gameId === gameId) {
        setGame(prev => ({
          ...prev,
          message: `¡${data.playerName} dijo UNO!`
        }));
      }
    });

    return () => {
      socket.off('card_played');
      socket.off('card_drawn');
      socket.off('cards_dealt');
      socket.off('top_card_revealed');
      socket.off('uno_called');
    };
  }, [socket, gameId]);

  // Inicializar el juego
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Verificar si el juego ya está inicializado
        const response = await fetch(`http://localhost:3000/top-card/${gameId}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          }
        });

        if (!response.ok) {
          // Si no hay carta superior, inicializar el juego
          await dealCards();
          await getTopCard();
        } else {
          // Si ya hay carta superior, solo obtener el estado actual
          const data = await response.json();
          const topCard = {
            ...data.topCard.card,
            _id: data.topCard._id
          };
          setGame(prev => ({
            ...prev,
            topCard: topCard,
            lastPlayedCard: topCard
          }));
        }

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

  // Nuevo useEffect para actualizar el estado del juego
  useEffect(() => {
    const updateGameState = async () => {
      try {
        const response = await fetch(`http://localhost:3000/games/${gameId}/state`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (!response.ok) throw new Error('Error al obtener estado del juego');

        const data = await response.json();
        const currentUserId = localStorage.getItem('userId');
        
        setGame(prev => ({
          ...prev,
          currentTurn: data.currentPlayer,
          isMyTurn: data.currentPlayer.id === currentUserId,
          topCard: data.topCard.card,
          lastPlayedCard: data.topCard.card,
          message: `Turno de ${data.currentPlayer.username}`
        }));
      } catch (error) {
        console.error('Error al actualizar estado del juego:', error);
      }
    };

    // Actualizar estado inicial
    updateGameState();

    // Actualizar estado cada 5 segundos
    const interval = setInterval(updateGameState, 5000);

    return () => clearInterval(interval);
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
      // Primero intentamos obtener la última carta jugada
      const response = await fetch(`http://localhost:3000/top-card/${gameId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const topCard = {
          ...data.topCard.card,
          _id: data.topCard._id
        };
        setGame(prev => ({ 
          ...prev, 
          topCard: topCard,
          lastPlayedCard: topCard
        }));
        return data;
      }

      // Si no hay última carta jugada, obtenemos la primera carta del mazo
      const initialCardResponse = await fetch('http://localhost:3000/games/top-card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId
        })
      });
      
      if (!initialCardResponse.ok) throw new Error('Error al obtener carta superior');
      
      const initialCardData = await initialCardResponse.json();
      setGame(prev => ({ 
        ...prev, 
        topCard: initialCardData.top_card,
        lastPlayedCard: initialCardData.top_card
      }));
      return initialCardData;
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
      if (data.success && Array.isArray(data.hand)) {
        setGame(prev => ({ ...prev, hand: data.hand }));
      } else {
        setGame(prev => ({ ...prev, hand: [] }));
      }
      return data;
    } catch (error) {
      console.error('Error al obtener mano:', error);
      setGame(prev => ({ ...prev, hand: [], error: 'Error al obtener mano: ' + error.message }));
      throw error;
    }
  };

  // Jugar una carta
  const playCard = async (card) => {
    const currentUserId = localStorage.getItem('userId');
    
    if (!game.currentTurn || game.currentTurn.id !== currentUserId) {
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

    const card = { 
      ...game.hand[game.selectedCardIndex],
      color: null
    };

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
          cardPlayed: {
            _id: card._id,
            type: card.type,
            value: card.value,
            color: null
          },
          newColor: color
        })
      });
      
      if (!response.ok) throw new Error('Jugada no válida');
      
      const data = await response.json();
      
      // Eliminar la carta jugada de la mano
      const updatedHand = game.hand.filter(c => c._id !== card._id);
      
      setGame(prev => ({ 
        ...prev, 
        hand: updatedHand,
        lastPlayedCard: { ...card, color },
        topCard: { ...card, color },
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
    
    // Determinar el texto a mostrar en la carta
    let cardText;
    if (card.type === 'action') {
      cardText = card.value; // Para cartas de acción (skip, reverse, draw2)
    } else if (card.type === 'wild' || card.type === 'wild_draw4') {
      cardText = card.type === 'wild' ? 'WILD' : '+4';
    } else {
      cardText = card.value;
    }
    
    return (
      <div 
        className={`${baseClasses} ${sizeClasses} ${backgroundColor} ${selectedClass}`}
        onClick={() => isHandCard && playCard(card)}
      >
        <div className="absolute inset-1 bg-white/10 rounded">
          <div className="flex h-full items-center justify-center text-white font-bold text-xl">
            {cardText}
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

  // Modificar el renderizado de la mano para incluir validación
  const renderHand = () => {
    if (!Array.isArray(game.hand)) {
      return (
        <div className="text-center text-red-600">
          Error al cargar las cartas
        </div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-4">
        {game.hand.map((card, index) => (
          <div key={card._id || index} className="transition-transform">
            {renderCard(card, index, false, true)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      {/* Animaciones */}
      {renderAnimation()}
      
      {/* Selector de color */}
      {renderColorPicker()}
      
      {/* Mensajes y Errores */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {game.error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-lg mx-auto max-w-2xl mt-4">
            <p className="font-bold">Error</p>
            <p>{game.error}</p>
          </div>
        )}
        
        {/* Indicador de Turno */}
        <div className={`text-center p-4 text-2xl font-bold transition-all duration-300 ${
          game.isMyTurn 
            ? 'bg-green-500 text-white animate-pulse' 
            : 'bg-gray-700 text-white'
        }`}>
          {game.isMyTurn 
            ? '¡ES TU TURNO!' 
            : `Turno de: ${game.currentTurn?.username || 'Esperando...'}`
          }
        </div>
      </div>
      
      {/* Mesa de juego */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden mt-20">
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
              <button 
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  game.isMyTurn
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-600'
                }`}
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