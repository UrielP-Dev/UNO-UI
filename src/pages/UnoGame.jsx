import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const UnoGame = () => {
  const navigate = useNavigate();
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
  const [scores, setScores] = useState([]);

  // Obtener token
  const getToken = () => localStorage.getItem('token');

  // Inicializar socket
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Escuchar el evento de fin de juego
    newSocket.on('game_ended', (data) => {
      if (data.gameId === gameId) {
        navigate(`/winner/${gameId}`); // Redirigir a la pantalla de Winner
      }
    });

    return () => {
      newSocket.close();
    };
  }, [gameId, navigate]);

  // Escuchar eventos del socket
  useEffect(() => {
    if (!socket) return;

    // Cuando se juega una carta
    socket.on('card_played', async (data) => {
      if (data.gameId === gameId) {
        // Actualizar la mano si soy el jugador que jugó
        if (data.playerId === localStorage.getItem('userId')) {
          await getUserHand();
        }
        
        // Actualizar los scores después de cada jugada
        await fetchScores();
        
        setGame(prev => ({
          ...prev,
          topCard: data.cardPlayed,
          lastPlayedCard: data.cardPlayed,
          currentTurn: {
            id: data.nextPlayerId,
            username: data.nextPlayerName || 'Jugador'
          },
          isMyTurn: data.nextPlayerId === localStorage.getItem('userId'),
          message: `${data.nextPlayerName || 'Jugador'} debe jugar`
        }));
      }
    });

    // Cuando alguien roba una carta
    socket.on('card_drawn', async (data) => {
      if (data.gameId === gameId) {
        // Actualizar la mano si soy el jugador que robó
        if (data.playerId === localStorage.getItem('userId')) {
          await getUserHand();
        }

        // Obtener el nuevo estado del juego
        const stateResponse = await fetch(`http://localhost:3000/games/${gameId}/state`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (stateResponse.ok) {
          const stateData = await stateResponse.json();
          const currentUserId = localStorage.getItem('userId');
          
          setGame(prev => ({
            ...prev,
            currentTurn: stateData.currentPlayer,
            isMyTurn: stateData.currentPlayer.id === currentUserId,
            message: `Turno de ${stateData.currentPlayer.username}`
          }));
        }
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

    // Cuando alguien juega una wild card
    socket.on('wild_card_played', (data) => {
      if (data.gameId === gameId) {
        console.log('Wild card jugada por otro jugador:', data);
        setGame(prev => ({
          ...prev,
          message: `¡${data.playerName} cambió el color a ${data.newColor}!`,
          topCard: {
            type: data.cardType,
            color: data.newColor,
            value: data.cardType === 'wild_draw4' ? '+4' : 'WILD'
          }
        }));
      }
    });

    // Cuando un jugador gana
    socket.on('game_over', (data) => {
      if (data.gameId === gameId) {
        const isWinner = data.winner === localStorage.getItem('userId');
        
        setGame(prev => ({
          ...prev,
          gameStarted: false,
          message: isWinner ? '¡Felicidades! ¡Has ganado!' : `¡${data.playerName} ha ganado la partida!`,
          animation: {
            active: true,
            type: 'winner',
            card: null
          }
        }));

        // Actualizar los scores finales
        fetchScores();

        // Todos los jugadores serán redirigidos después de la animación
        setTimeout(() => {
          navigate(`/winner/${gameId}`);
        }, 3000);
      }
    });

    // Cuando se actualiza el puntaje
    socket.on('score_updated', (data) => {
      if (data.gameId === gameId) {
        fetchScores(); // Actualizar los puntajes en tiempo real
      }
    });

    return () => {
      socket.off('card_played');
      socket.off('card_drawn');
      socket.off('cards_dealt');
      socket.off('top_card_revealed');
      socket.off('uno_called');
      socket.off('wild_card_played');
      socket.off('game_over');
      socket.off('score_updated');
    };
  }, [socket, gameId, navigate]);

  // Modificar la inicialización del juego
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setGame(prev => ({ ...prev, loading: true }));
        
        // Primero obtener el estado actual del juego
        const stateResponse = await fetch(`http://localhost:3000/games/${gameId}/state`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (!stateResponse.ok) {
          // Si no hay estado, inicializar el juego
          await dealCards();
          const topCardResponse = await fetch('http://localhost:3000/games/top-card', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${getToken()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              game_id: gameId
            })
          });

          if (!topCardResponse.ok) throw new Error('Error al obtener carta inicial');
          const topCardData = await topCardResponse.json();
          
          setGame(prev => ({
            ...prev,
            topCard: topCardData.top_card,
            lastPlayedCard: topCardData.top_card
          }));
        } else {
          // Si hay estado, usarlo
          const stateData = await stateResponse.json();
          const currentUserId = localStorage.getItem('userId');
          
          setGame(prev => ({
            ...prev,
            topCard: stateData.topCard.card,
            lastPlayedCard: stateData.topCard.card,
            currentTurn: stateData.currentPlayer,
            isMyTurn: stateData.currentPlayer.id === currentUserId,
            message: `Turno de ${stateData.currentPlayer.username}`
          }));
        }

        // Obtener la mano del jugador
        await getUserHand();
        
        // Obtener los puntajes iniciales
        await fetchScores();

        setGame(prev => ({ 
          ...prev, 
          gameStarted: true, 
          loading: false 
        }));

      } catch (error) {
        console.error('Error en initializeGame:', error);
        setGame(prev => ({
          ...prev,
          error: 'Error al inicializar el juego: ' + error.message,
          loading: false
        }));
      }
    };

    if (gameId && socket) {
      initializeGame();
    }
  }, [gameId, socket, navigate]);

  // Eliminar el useEffect de actualización periódica y reemplazarlo con este:
  useEffect(() => {
    if (!socket) return;

    // Escuchar actualizaciones de estado
    socket.on('state_updated', (data) => {
      if (data.gameId === gameId) {
        const currentUserId = localStorage.getItem('userId');
        setGame(prev => ({
          ...prev,
          currentTurn: data.state.currentPlayer,
          isMyTurn: data.state.currentPlayer.id === currentUserId,
          topCard: data.state.topCard.card,
          lastPlayedCard: data.state.topCard.card,
          message: `Turno de ${data.state.currentPlayer.username}`
        }));
      }
    });

    // Escuchar actualizaciones del historial
    socket.on('history_updated', (data) => {
      if (data.gameId === gameId) {
        fetchScores();
      }
    });

    return () => {
      socket.off('state_updated');
      socket.off('history_updated');
    };
  }, [socket, gameId]);

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
      // Si es un "draw 2", actualiza la mano del siguiente jugador
      if (card.type === 'draw2') {
        await updateNextPlayerHand(game.currentTurn.id, 2); // Llama a la función para actualizar la mano
      }

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
      
      // Eliminar la carta jugada de la mano
      const updatedHand = game.hand.filter(c => c._id !== card._id);

      // Verificar si el jugador se quedó sin cartas
      if (updatedHand.length === 0) {
        // Finalizar el juego y redirigir a la página de Winner
        await fetch('http://localhost:3000/games/end', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ game_id: gameId })
        });

        // Emitir evento de fin de juego para todos los jugadores
        if (socket) {
          socket.emit('game_over', {
            gameId: gameId,
            winner: currentUserId,
            playerName: localStorage.getItem('username')
          });
        }

        // No es necesario redirigir aquí, ya que se manejará en el listener del socket
        return;
      }
      
      // Obtener el nuevo estado del juego
      const stateResponse = await fetch(`http://localhost:3000/games/${gameId}/state`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!stateResponse.ok) throw new Error('Error al obtener el estado del juego');
      const stateData = await stateResponse.json();
      
      setGame(prev => ({ 
        ...prev, 
        hand: updatedHand,
        lastPlayedCard: card,
        topCard: card,
        isMyTurn: stateData.currentPlayer.id === currentUserId,
        currentTurn: stateData.currentPlayer,
        message: `Es el turno de ${stateData.currentPlayer.username}`,
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
      
      // Actualizar scores después de cada jugada
      await fetchScores();

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
    if (!Array.isArray(game.hand) || game.selectedCardIndex === null || !game.hand[game.selectedCardIndex]) {
      setGame(prev => ({ 
        ...prev, 
        showColorPicker: false,
        error: 'Error al seleccionar color: Carta no válida'
      }));
      return;
    }

    const selectedCard = game.hand[game.selectedCardIndex];
    const currentUserId = localStorage.getItem('userId');

    try {
      setGame(prev => ({ 
        ...prev,
        showColorPicker: false,
        loading: true,
        animation: {
          active: true,
          type: 'play',
          card: selectedCard
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
            _id: selectedCard._id,
            type: selectedCard.type,
            value: selectedCard.value,
            color: null
          },
          newColor: color
        })
      });
      
      if (!response.ok) throw new Error('Jugada no válida');
      
      // Eliminar la carta jugada de la mano
      const updatedHand = game.hand.filter(c => c._id !== selectedCard._id);

      // Verificar si el jugador se quedó sin cartas
      if (updatedHand.length === 0) {
        await fetch('http://localhost:3000/games/increment-score', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            game_id: gameId,
            points: 500
          })
        });

        if (socket) {
          socket.emit('game_over', {
            gameId: gameId,
            winner: currentUserId,
            playerName: localStorage.getItem('username')
          });
        }

        // No es necesario hacer la redirección aquí, ya que se manejará en el listener del socket
        return;
      }

      // Obtener el nuevo estado del juego
      const stateResponse = await fetch(`http://localhost:3000/games/${gameId}/state`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!stateResponse.ok) throw new Error('Error al obtener el estado del juego');
      const stateData = await stateResponse.json();
      
      // Emitir evento de cambio de color a través del socket
      if (socket) {
        socket.emit('wild_card_played', {
          gameId: gameId,
          playerId: localStorage.getItem('userId'),
          playerName: localStorage.getItem('username'),
          cardType: selectedCard.type,
          newColor: color
        });
      }
      
      setGame(prev => ({ 
        ...prev, 
        hand: updatedHand,
        lastPlayedCard: { ...selectedCard, color },
        topCard: { ...selectedCard, color },
        isMyTurn: stateData.currentPlayer.id === currentUserId,
        currentTurn: stateData.currentPlayer,
        message: `Es el turno de ${stateData.currentPlayer.username}`,
        selectedCardIndex: null,
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));

      // Actualizar scores después de cada jugada
      await fetchScores();

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
      
      // Obtener el nuevo estado del juego
      const stateResponse = await fetch(`http://localhost:3000/games/${gameId}/state`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!stateResponse.ok) throw new Error('Error al obtener el estado del juego');
      const stateData = await stateResponse.json();
      
      // Actualizar la mano del jugador
      await getUserHand();
      
      const currentUserId = localStorage.getItem('userId');
      
      setGame(prev => ({ 
        ...prev, 
        isMyTurn: stateData.currentPlayer.id === currentUserId,
        currentTurn: stateData.currentPlayer,
        message: `Turno de ${stateData.currentPlayer.username}`,
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
      
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
    
    const colorOptions = [
      { name: 'red', label: 'Rojo', class: 'bg-red-600' },
      { name: 'blue', label: 'Azul', class: 'bg-blue-600' },
      { name: 'green', label: 'Verde', class: 'bg-green-600' },
      { name: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' }
    ];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Selecciona un color</h3>
          <div className="grid grid-cols-2 gap-4">
            {colorOptions.map(color => (
              <button 
                key={color.name}
                onClick={() => {
                  console.log(`Color seleccionado: ${color.name}`);
                  selectColor(color.name);
                }}
                className={`w-24 h-24 ${color.class} rounded-lg hover:ring-4 hover:ring-yellow-400 relative`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  {color.label}
                </span>
              </button>
            ))}
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

  // Agregar animación de victoria
  const renderWinnerAnimation = () => {
    if (game.animation.type !== 'winner') return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center transform animate-bounce">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-orange-600 mb-4">
            {game.message}
          </h2>
          <div className="text-gray-600">
            Redirigiendo en unos segundos...
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <span role="img" aria-label="trophy" className="text-4xl">🏆</span>
            <span role="img" aria-label="star" className="text-4xl">⭐</span>
            <span role="img" aria-label="party" className="text-4xl">🎊</span>
          </div>
        </div>
      </div>
    );
  };

  // Modificar la función fetchScores para ordenar los puntajes correctamente
  const fetchScores = async () => {
    try {
      const response = await fetch(`http://localhost:3000/games/scores`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          game_id: gameId
        })
      });

      if (!response.ok) throw new Error('Error al obtener puntajes');
      
      const data = await response.json();
      // Ordenar scores de menor a mayor y luego invertir el orden
      const sortedScores = data.value.scores.sort((a, b) => a.points - b.points).reverse();
      setScores(sortedScores);
    } catch (error) {
      console.error('Error al obtener puntajes:', error);
    }
  };

  // Función para actualizar la mano del siguiente jugador
  const updateNextPlayerHand = async (nextPlayerId, numberOfCards) => {
    // Lógica para actualizar la mano del siguiente jugador
    // Esto puede incluir una llamada a un endpoint para obtener las cartas
    // y luego actualizar el estado del juego
    await getUserHand(); // Asegúrate de que la mano se actualice
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
      {renderWinnerAnimation()}
      
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

      {/* Tabla de puntajes mejorada */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-t-xl p-4">
          <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
            <span role="img" aria-label="trophy">🏆</span>
            Tabla de Posiciones
            <span role="img" aria-label="trophy">🏆</span>
          </h2>
        </div>
        
        <div className="bg-white rounded-b-xl shadow-xl overflow-hidden">
          <div className="p-4">
            {scores.map((score, index) => (
              <div 
                key={index}
                className={`flex items-center p-4 ${
                  index % 2 === 0 ? 'bg-orange-50' : 'bg-white'
                } transition-all hover:bg-orange-100 border-b border-orange-100`}
              >
                {/* Posición */}
                <div className="w-16 flex-shrink-0">
                  <span className={`
                    inline-flex items-center justify-center w-8 h-8 rounded-full 
                    ${index === 0 ? 'bg-yellow-400 text-white' : 
                      index === 1 ? 'bg-gray-300 text-white' :
                      index === 2 ? 'bg-orange-700 text-white' :
                      'bg-gray-100 text-gray-600'}
                    font-bold text-lg
                  `}>
                    {index + 1}
                  </span>
                </div>

                {/* Jugador */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="cat" className="text-2xl">
                      {index === 0 ? '😺' : index === 1 ? '😸' : '😽'}
                    </span>
                    <span className="font-semibold text-lg text-gray-800">
                      {score.player}
                    </span>
                  </div>
                </div>

                {/* Puntos */}
                <div className="flex-shrink-0 w-32 text-right">
                  <span className={`
                    font-bold text-lg
                    ${index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-600' :
                      index === 2 ? 'text-orange-700' :
                      'text-gray-600'}
                  `}>
                    {score.points.toLocaleString()} pts
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer con estadísticas */}
          <div className="bg-orange-50 p-4 border-t border-orange-100">
            <div className="text-center text-sm text-gray-600">
              <p>Total de jugadores: {scores.length}</p>
              <p>Puntaje más alto: {scores[0]?.points.toLocaleString() || 0} pts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnoGame;