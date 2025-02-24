import { Crown } from 'lucide-react';

const RoomsHeader = ({ roomCount }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-amber-800">Game Rooms</h2>
      <div className="flex items-center gap-2 text-amber-700 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-100">
        <Crown className="w-4 h-4" />
        <span className="font-medium text-sm">{roomCount} Active Rooms</span>
      </div>
    </div>
  );
};

export default RoomsHeader; 