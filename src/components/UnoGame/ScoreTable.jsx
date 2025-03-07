const ScoreTable = ({ scores }) => {
  return (
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
  );
};

export default ScoreTable; 