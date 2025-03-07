const Card = ({ card, index, isTopCard = false, isHandCard = false, onClick }) => {
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
      className={`${baseClasses} ${sizeClasses} ${backgroundColor}`}
      onClick={() => isHandCard && onClick && onClick(card)}
    >
      <div className="absolute inset-1 bg-white/10 rounded">
        <div className="flex h-full items-center justify-center text-white font-bold text-xl">
          {cardText}
        </div>
      </div>
    </div>
  );
};

export default Card; 