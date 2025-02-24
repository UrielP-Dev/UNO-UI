import { Plus } from 'lucide-react';

const CreateRoomCard = ({ onClick }) => {
  return (
    <div onClick={onClick} className="mb-4">
      <div className="bg-amber-50 rounded-xl p-6 border-2 border-dashed border-amber-200 hover:border-amber-300 transition-colors
        flex flex-col items-center justify-center text-center cursor-pointer">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
          <Plus className="w-6 h-6 text-amber-700" />
        </div>
        <h3 className="font-bold text-lg text-amber-800">Create New Room</h3>
        <p className="text-amber-600 text-sm mt-1">Start your own game</p>
      </div>
    </div>
  );
};

export default CreateRoomCard; 