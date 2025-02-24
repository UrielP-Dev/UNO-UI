import { X } from 'lucide-react';
import { useState } from 'react';

const CreateRoomModal = ({ isOpen, onClose, onCreateRoom }) => {
  const [roomName, setRoomName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreateRoom(roomName);
      setRoomName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-amber-600 hover:text-amber-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-amber-800 mb-4">Create New Room</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-amber-700 mb-1">
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full px-4 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-400 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-amber-600 hover:text-amber-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!roomName.trim()}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg
                hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal; 