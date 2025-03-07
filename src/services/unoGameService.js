const API_URL = import.meta.env.VITE_BACKEND_URL;

// Obtener token
const getToken = () => localStorage.getItem('token');

// Repartir cartas
export const dealCards = async (gameId) => {
  try {
    const response = await fetch(`${API_URL}/games/deal-cards`, {
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
    
    return await response.json();
  } catch (error) {
    console.error('Error al repartir cartas:', error);
    throw error;
  }
};

// Obtener la carta superior
export const getTopCard = async (gameId) => {
  try {
    // Primero intentamos obtener la última carta jugada
    const response = await fetch(`${API_URL}/top-card/${gameId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return await response.json();
    }

    // Si no hay última carta jugada, obtenemos la primera carta del mazo
    const initialCardResponse = await fetch(`${API_URL}/games/top-card`, {
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
    
    return await initialCardResponse.json();
  } catch (error) {
    console.error('Error al obtener carta superior:', error);
    throw error;
  }
};

// Obtener mano del usuario
export const getUserHand = async (gameId) => {
  try {
    const response = await fetch(`${API_URL}/hand`, {
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
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener mano:', error);
    throw error;
  }
};

// Jugar una carta
export const playCard = async (gameId, card, newColor = null) => {
  try {
    const payload = {
      game_id: gameId,
      cardPlayed: {
        _id: card._id,
        type: card.type,
        value: card.value,
        color: card.color
      }
    };
    
    if (newColor) {
      payload.newColor = newColor;
    }
    
    const response = await fetch(`${API_URL}/game-rules/play-card`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Jugada no válida');
    
    return await response.json();
  } catch (error) {
    console.error('Error al jugar carta:', error);
    throw error;
  }
};

// Robar una carta
export const drawCard = async (gameId) => {
  try {
    const response = await fetch(`${API_URL}/game-rules/draw-card`, {
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
    
    return await response.json();
  } catch (error) {
    console.error('Error al robar carta:', error);
    throw error;
  }
};

// Obtener estado del juego
export const getGameState = async (gameId) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}/state`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) throw new Error('Error al obtener el estado del juego');
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener estado del juego:', error);
    throw error;
  }
};

// Obtener puntajes
export const getScores = async (gameId) => {
  try {
    const response = await fetch(`${API_URL}/games/scores`, {
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
    return data.value.scores.sort((a, b) => a.points - b.points).reverse();
  } catch (error) {
    console.error('Error al obtener puntajes:', error);
    throw error;
  }
};

// Decir UNO
export const sayUno = async (gameId) => {
  try {
    const response = await fetch(`${API_URL}/uno`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'Say UNO',
        game_id: gameId
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error al decir UNO:', error);
    throw error;
  }
}; 