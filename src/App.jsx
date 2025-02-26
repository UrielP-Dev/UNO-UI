import { Routes, Route } from 'react-router-dom';
import './App.css'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import UnoGame from './pages/UnoGame'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/game/:gameId" element={
        
          <GamePage />
        
      } />
      <Route path="/uno-game/:gameId" element={<UnoGame />} />

    </Routes>
  );
}

export default App;
