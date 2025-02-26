import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateRoomCard from '../components/CreateRoomCard';
import GameRoomCard from '../components/GameRoomCard';
import RoomsHeader from '../components/RoomsHeader';
import Header from '../components/Header';
import CreateRoomModal from '../components/CreateRoomModal';
import socket from '../config/socket'; // Importamos la conexión a Socket.IO

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch('http://localhost:3000/games', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/auth');
        return;
      }

      const data = await response.json();
      if (data.success && data.data && data.data.value) {
        setRooms(data.data.value);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();

socket.on('room_created', (newRoom) => {
  const room = { 
    _id: newRoom._id || newRoom.gameId, 
    players: newRoom.players || [], 
    ...newRoom,
  };
  setRooms((prevRooms) => [...prevRooms, room]);
});

    
    return () => {
      socket.off('room_created');
    };
  }, [navigate]);

  const handleCreateRoom = async (name) => {
    try {
      const response = await fetch('http://localhost:3000/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name }),
      });
      
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Header
        username={username || 'Usuario'}
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('userId');
          window.location.reload();
        }}
      />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <RoomsHeader roomCount={rooms.length} />
        <CreateRoomCard onClick={() => setIsModalOpen(true)} />
        <div className="grid grid-cols-2 gap-4">
          {rooms.map(room => (
            <GameRoomCard
              key={room._id}
              room={room}
              onNavigate={navigate}
              onJoinSuccess={(gameId) => navigate(`/game/${gameId}`)}
            />
          ))}
        </div>
      </main>
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
};

export default HomePage;
