import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trophy } from 'lucide-react';
import PropTypes from 'prop-types';

const HighscoresModal = ({ isOpen, onClose, scores }) => {
  const validScores = Array.isArray(scores) ? scores : [];
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl rounded-2xl bg-white p-8 w-full shadow-xl max-h-[90vh] flex flex-col">
          <Dialog.Title className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-orange-500" />
            Tabla de Puntuaciones Más Altas
          </Dialog.Title>
          
          <div className="overflow-y-auto flex-1">
            {validScores.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-orange-100">
                <table className="min-w-full table-auto">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Posición</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jugador</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Puntos</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sala</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {validScores.map((score, index) => (
                      <tr 
                        key={score._id || index} 
                        className={index % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'}
                      >
                        <td className="px-6 py-4 text-sm">
                          <span className="font-semibold">{index + 1}°</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {score.player?.username || 'Desconocido'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-orange-600">
                          {score.points || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {score.game?.name || 'Desconocido'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {score.createdAt ? 
                            format(new Date(score.createdAt), 'dd MMM yyyy HH:mm', { locale: es }) : 
                            'Fecha desconocida'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay puntuaciones disponibles
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

HighscoresModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  scores: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      player: PropTypes.shape({
        username: PropTypes.string.isRequired
      }).isRequired,
      game: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      points: PropTypes.number.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ).isRequired
};

export default HighscoresModal; 