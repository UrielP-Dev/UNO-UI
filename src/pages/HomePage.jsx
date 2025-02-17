import { Cat, Users, Crown, Plus, LogOut } from 'lucide-react';

// Header Component with User Info
const Header = ({ username = "CoolCat123" }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-amber-100 py-4 px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
            <Cat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            UNO Cat
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Cat className="w-5 h-5 text-amber-700" />
            </div>
            <span className="font-medium text-amber-800">{username}</span>
          </div>
          <button className="text-amber-700 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Game Room Card Component
const RoomCard = ({ name, players, maxPlayers, isActive }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-amber-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-amber-800">{name}</h3>
        {isActive && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
            Active
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-amber-700">
        <Users className="w-5 h-5" />
        <span>{players}/{maxPlayers} players</span>
      </div>
      
      <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-2 px-4 rounded-lg
        hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
        Join Room
      </button>
    </div>
  );
};

// Create Room Card Component
const CreateRoomCard = () => {
  return (
    <div className="bg-amber-50 rounded-xl p-6 border-2 border-dashed border-amber-200 hover:border-amber-300 transition-colors
      flex flex-col items-center justify-center text-center cursor-pointer">
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
        <Plus className="w-6 h-6 text-amber-700" />
      </div>
      <h3 className="font-bold text-lg text-amber-800">Create New Room</h3>
      <p className="text-amber-600 text-sm mt-1">Start your own game</p>
    </div>
  );
};

// Main Home Page Component
const HomePage = () => {
  // Sample rooms data
  const rooms = [
    { id: 1, name: "Kitty's Paradise", players: 3, maxPlayers: 4, isActive: true },
    { id: 2, name: "Whiskers Club", players: 2, maxPlayers: 4, isActive: true },
    { id: 3, name: "Paws & Cards", players: 1, maxPlayers: 4, isActive: false },
    { id: 4, name: "Meow Masters", players: 4, maxPlayers: 4, isActive: true },
    { id: 5, name: "Cat Casino", players: 2, maxPlayers: 4, isActive: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Header username="CoolCat123" />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-800">Game Rooms</h2>
          <div className="flex items-center gap-2 text-amber-700 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-100">
            <Crown className="w-5 h-5" />
            <span className="font-medium">5 Active Rooms</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CreateRoomCard />
          {rooms.map(room => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;