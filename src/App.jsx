import { useState, useEffect } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token, username) => {
    localStorage.setItem('token', token);
    setUsername(username);
    setIsAuthenticated(true);
  };

  return isAuthenticated ? 
    <HomePage username={username} /> : 
    <AuthPage onLogin={handleLogin} />;
}

export default App;
