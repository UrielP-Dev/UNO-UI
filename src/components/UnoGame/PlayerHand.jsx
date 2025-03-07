import Card from './Card';

const PlayerHand = ({ hand, onPlayCard, selectedCardIndex }) => {
  return (
    <div className="bg-gray-100 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tu mano</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {hand.map((card, index) => (
          <div 
            key={card._id || index} 
            className={`transition-transform ${selectedCardIndex === index ? 'ring-4 ring-yellow-400 -translate-y-4' : ''}`}
          >
            <Card 
              card={card} 
              index={index} 
              isHandCard={true} 
              onClick={onPlayCard} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand; 