import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import GameBoard from '../components/UnoGame/GameBoard';
import ScoreTable from '../components/UnoGame/ScoreTable';
import Notification from '../components/UnoGame/Notification';
import ColorPicker from '../components/UnoGame/ColorPicker';
import GameAnimation from '../components/UnoGame/GameAnimation';
import TurnIndicator from '../components/UnoGame/TurnIndicator';
import * as gameService from '../services/unoGameService';

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
      message: ''
    }
  });
  const [socket, setSocket] = useState(null);
  const [scores, setScores] = useState([]);
  const [notification, setNotification] = useState({
    message: '',
    type: '',
    show: false
  });

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'info', duration = 3000) => {
    setNotification({
      message,
      type,
      show: true
    });
    
    // Hacer que la notificación desaparezca automáticamente después de la duración especificada
    setTimeout(() => {
      setNotification(prev => ({...prev, show: false}));
    }, duration);
  };

  // Función para decir UNO
  const handleSayUno = async () => {
    try {
      const data = await gameService.sayUno(gameId);
      
      if (!data.success) {
        showNotification(data.message, 'error');
        return;
      }

      showNotification('¡Has dicho UNO!', 'success');
    } catch (error) {
      console.error('Error al decir UNO:', error);
      showNotification('Error al decir UNO: ' + error.message, 'error');
    }
  };

  // Inicializar socket
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL);
    setSocket(newSocket);

    // Escuchar el evento de fin de juego
    newSocket.on('game_ended', (data) => {
      if (data.gameId === gameId) {
        navigate(`/winner/${gameId}`);
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
          const handData = await gameService.getUserHand(gameId);
          if (handData.success && Array.isArray(handData.hand)) {
            setGame(prev => ({ ...prev, hand: handData.hand }));
          }
        }
        
        // Actualizar los scores después de cada jugada
        const updatedScores = await gameService.getScores(gameId);
        setScores(updatedScores);
        
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
          const handData = await gameService.getUserHand(gameId);
          if (handData.success && Array.isArray(handData.hand)) {
            setGame(prev => ({ ...prev, hand: handData.hand }));
          }
        }

        // Obtener el nuevo estado del juego
        const stateData = await gameService.getGameState(gameId);
        const currentUserId = localStorage.getItem('userId');
        
        setGame(prev => ({
          ...prev,
          currentTurn: stateData.currentPlayer,
          isMyTurn: stateData.currentPlayer.id === currentUserId,
          message: `Turno de ${stateData.currentPlayer.username}`
        }));
      }
    });

    // Cuando se reparten las cartas iniciales
    socket.on('cards_dealt', (data) => {
      if (data.gameId === gameId) {
        gameService.getUserHand(gameId).then(handData => {
          if (handData.success && Array.isArray(handData.hand)) {
            setGame(prev => ({ ...prev, hand: handData.hand }));
          }
        });
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
        const playerName = data.playerName || 'Un jugador';
        showNotification(`¡${playerName} tiene UNO!`, 'warning');
      }
    });

    // Cuando alguien juega una wild card
    socket.on('wild_card_played', (data) => {
      if (data.gameId === gameId) {
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
            message: isWinner ? '¡Felicidades! ¡Has ganado!' : `¡${data.playerName} ha ganado la partida!`
          }
        }));

        // Actualizar los scores finales
        gameService.getScores(gameId).then(setScores);

        // Todos los jugadores serán redirigidos después de la animación
        setTimeout(() => {
          navigate(`/winner/${gameId}`);
        }, 3000);
      }
    });

    // Cuando se actualiza el puntaje
    socket.on('score_updated', (data) => {
      if (data.gameId === gameId) {
        gameService.getScores(gameId).then(setScores);
      }
    });

    // Escuchar actualizaciones de estado
    socket.on('state_updated', async (data) => {
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

        // Revisar la mano del jugador al inicio de cada turno
        const handData = await gameService.getUserHand(gameId);
        if (handData.success && Array.isArray(handData.hand)) {
          setGame(prev => ({ ...prev, hand: handData.hand }));
        }
      }
    });

    // Escuchar actualizaciones del historial
    socket.on('history_updated', (data) => {
      if (data.gameId === gameId) {
        gameService.getScores(gameId).then(setScores);
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
      socket.off('state_updated');
      socket.off('history_updated');
    };
  }, [socket, gameId, navigate]);

  // Inicialización del juego
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setGame(prev => ({ ...prev, loading: true }));
        
        // Obtener el estado actual del juego
        try {
          const stateData = await gameService.getGameState(gameId);
          const currentUserId = localStorage.getItem('userId');
          
          setGame(prev => ({
            ...prev,
            topCard: stateData.topCard.card,
            lastPlayedCard: stateData.topCard.card,
            currentTurn: stateData.currentPlayer,
            isMyTurn: stateData.currentPlayer.id === currentUserId,
            message: `Turno de ${stateData.currentPlayer.username}`
          }));
        } catch (error) {
          // Si no hay estado, inicializar el juego
          await gameService.dealCards(gameId);
          const topCardData = await gameService.getTopCard(gameId);
          
          setGame(prev => ({
            ...prev,
            topCard: topCardData.top_card || topCardData.topCard?.card,
            lastPlayedCard: topCardData.top_card || topCardData.topCard?.card
          }));
        }

        // Obtener la mano del jugador
        const handData = await gameService.getUserHand(gameId);
        if (handData.success && Array.isArray(handData.hand)) {
          setGame(prev => ({ ...prev, hand: handData.hand }));
        }
        
        // Obtener los puntajes iniciales
        const scoresData = await gameService.getScores(gameId);
        setScores(scoresData);

        // Obtener el estado final del juego
        const finalStateData = await gameService.getGameState(gameId);
        const currentUserIdFinal = localStorage.getItem('userId');
        
        setGame(prev => ({
          ...prev,
          topCard: finalStateData.topCard.card,
          lastPlayedCard: finalStateData.topCard.card,
          currentTurn: finalStateData.currentPlayer,
          isMyTurn: finalStateData.currentPlayer.id === currentUserIdFinal,
          message: `Turno de ${finalStateData.currentPlayer.username}`,
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
  }, [gameId, socket]);

  // Función para jugar una carta
  const handlePlayCard = async (card) => {
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

      const response = await gameService.playCard(gameId, card);
      
      // Detener la animación independientemente del resultado
      setGame(prev => ({
        ...prev,
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
      
      // Si la carta no se puede jugar, mostrar un mensaje descriptivo
      if (!response.success) {
        showNotification(response.message, 'error', 3000);
        
        // Actualizar el estado del juego para mantener la sincronización
        try {
          const stateData = await gameService.getGameState(gameId);
          const handData = await gameService.getUserHand(gameId);
          
          if (handData.success && Array.isArray(handData.hand)) {
            setGame(prev => ({ 
              ...prev, 
              hand: handData.hand,
              topCard: stateData.topCard.card,
              lastPlayedCard: stateData.topCard.card,
              currentTurn: stateData.currentPlayer,
              isMyTurn: stateData.currentPlayer.id === currentUserId,
              message: `Turno de ${stateData.currentPlayer.username}`
            }));
          }
        } catch (syncError) {
          console.error('Error al sincronizar estado después de jugada inválida:', syncError);
        }
        
        return;
      }
      
      // Eliminar la carta jugada de la mano
      const updatedHand = game.hand.filter(c => c._id !== card._id);

      // Verificar si el jugador se quedó sin cartas
      if (updatedHand.length === 0) {
        // Finalizar el juego y redirigir a la página de Winner
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/games/end`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

        return;
      }
      
      // Obtener el nuevo estado del juego
      const stateData = await gameService.getGameState(gameId);
      
      setGame(prev => ({ 
        ...prev, 
        hand: updatedHand,
        lastPlayedCard: card,
        topCard: card,
        isMyTurn: stateData.currentPlayer.id === currentUserId,
        currentTurn: stateData.currentPlayer,
        message: `Es el turno de ${stateData.currentPlayer.username}`
      }));
      
      // Actualizar scores después de cada jugada
      const updatedScores = await gameService.getScores(gameId);
      setScores(updatedScores);

    } catch (error) {
      console.error('Error al jugar carta:', error);
      
      // Detener la animación y mostrar el error
      setGame(prev => ({ 
        ...prev, 
        loading: false,
        animation: {
          ...prev.animation,
          active: false
        }
      }));
      
      showNotification("Connection error. Please try again or draw a card.", 'error', 3000);
      
      // Intentar resincronizar el estado del juego
      try {
        const stateData = await gameService.getGameState(gameId);
        const handData = await gameService.getUserHand(gameId);
        const currentUserId = localStorage.getItem('userId');
        
        if (handData.success && Array.isArray(handData.hand)) {
          setGame(prev => ({ 
            ...prev, 
            hand: handData.hand,
            topCard: stateData.topCard.card,
            lastPlayedCard: stateData.topCard.card,
            currentTurn: stateData.currentPlayer,
            isMyTurn: stateData.currentPlayer.id === currentUserId,
            message: `Turno de ${stateData.currentPlayer.username}`
          }));
        }
      } catch (syncError) {
        console.error('Error al resincronizar estado después de error:', syncError);
      }
    }
  };

  // Función para seleccionar el color cuando se juega una wild card
  const handleSelectColor = async (color) => {
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

      await gameService.playCard(gameId, selectedCard, color);
      
      // Eliminar la carta jugada de la mano
      const updatedHand = game.hand.filter(c => c._id !== selectedCard._id);

      // Verificar si el jugador se quedó sin cartas
      if (updatedHand.length === 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/games/increment-score`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

        return;
      }

      // Obtener el nuevo estado del juego
      const stateData = await gameService.getGameState(gameId);
      
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
      const updatedScores = await gameService.getScores(gameId);
      setScores(updatedScores);

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

  // Función para robar una carta
  const handleDrawCard = async () => {
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

      await gameService.drawCard(gameId);
      
      // Obtener el nuevo estado del juego
      const stateData = await gameService.getGameState(gameId);
      
      // Actualizar la mano del jugador
      const handData = await gameService.getUserHand(gameId);
      if (handData.success && Array.isArray(handData.hand)) {
        setGame(prev => ({ ...prev, hand: handData.hand }));
      }
      
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

  // Renderizado principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      {/* Notificaciones */}
      <Notification 
        notification={notification} 
        setNotification={setNotification} 
      />
      
      {/* Animaciones */}
      <GameAnimation animation={game.animation} />
      
      {/* Selector de color */}
      <ColorPicker 
        show={game.showColorPicker} 
        onSelectColor={handleSelectColor} 
      />
      
      {/* Indicador de turno */}
      <TurnIndicator 
        isMyTurn={game.isMyTurn} 
        currentTurn={game.currentTurn} 
        error={game.error} 
      />
      
      {/* Tablero de juego */}
      <GameBoard 
        game={{...game, gameId}}
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        onSayUno={handleSayUno}
      />

      {/* Tabla de puntajes */}
      <ScoreTable scores={scores} />
    </div>
  );
};

export default UnoGame;