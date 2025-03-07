import Card from './Card';

const GameAnimation = ({ animation, renderCard }) => {
  if (!animation.active) return null;
  
  if (animation.type === 'play') {
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
          {animation.card && <Card card={animation.card} />}
        </div>
      </div>
    );
  }
  
  if (animation.type === 'draw') {
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 animate-pulse">
          <div className="w-20 h-32 bg-indigo-600 rounded-lg shadow-md"></div>
        </div>
      </div>
    );
  }
  
  if (animation.type === 'winner') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center transform animate-bounce">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-orange-600 mb-4">
            {animation.message}
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
  }
  
  return null;
};

export default GameAnimation; 