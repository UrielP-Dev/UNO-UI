import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const Winner = () => {
  const { gameId } = useParams();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchFinalScores = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/games/scores`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            game_id: gameId
          })
        });

        if (!response.ok) throw new Error('Error al obtener puntajes finales');
        
        const data = await response.json();
        const sortedScores = data.value.scores.sort((a, b) => a.points - b.points).reverse();
        setScores(sortedScores);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFinalScores();
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-orange-600 animate-pulse">
          Cargando resultados finales...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link 
            to="/"
            className="block w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-center"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-orange-600 mb-4">
            ¡Fin del Juego!
          </h1>
          <div className="text-4xl mb-8">
            🎉 🏆 🎊
          </div>
        </div>

        {/* Podio de ganadores */}
        <div className="flex justify-center items-end mb-16 gap-4">
          {/* Segundo lugar */}
          {scores[1] && (
            <div className="w-48 text-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="h-32 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg flex items-end justify-center p-4">
                <div className="text-white">
                  <div className="text-xl font-bold">{scores[1].player}</div>
                  <div>{scores[1].points.toLocaleString()} pts</div>
                </div>
              </div>
            </div>
          )}

          {/* Primer lugar */}
          {scores[0] && (
            <div className="w-48 text-center">
              <div className="text-4xl mb-2">👑</div>
              <div className="h-40 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg flex items-end justify-center p-4">
                <div className="text-white">
                  <div className="text-2xl font-bold">{scores[0].player}</div>
                  <div className="text-lg">{scores[0].points.toLocaleString()} pts</div>
                </div>
              </div>
            </div>
          )}

          {/* Tercer lugar */}
          {scores[2] && (
            <div className="w-48 text-center">
              <div className="text-4xl mb-2">🥉</div>
              <div className="h-24 bg-gradient-to-t from-orange-700 to-orange-600 rounded-t-lg flex items-end justify-center p-4">
                <div className="text-white">
                  <div className="text-xl font-bold">{scores[2].player}</div>
                  <div>{scores[2].points.toLocaleString()} pts</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla completa de puntajes */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4">
            <h2 className="text-xl font-bold text-white text-center">
              Puntajes Finales
            </h2>
          </div>
          
          <div className="p-4">
            {scores.map((score, index) => (
              <div 
                key={index}
                className={`flex items-center p-4 ${
                  index % 2 === 0 ? 'bg-orange-50' : 'bg-white'
                } border-b border-orange-100`}
              >
                <div className="w-12 text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
                </div>
                <div className="flex-grow font-semibold">
                  {score.player}
                </div>
                <div className="font-bold text-orange-600">
                  {score.points.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón para volver al inicio */}
        <div className="text-center mt-8">
          <Link 
            to="/"
            className="inline-block px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-bold"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Winner; 