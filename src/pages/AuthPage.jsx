import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import Card from '../components/Card';
import AuthHeader from '../components/AuthHeader';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  const decodeToken = (token) => {
    try {
      const [, payloadBase64] = token.split('.');
      const decodedPayload = JSON.parse(atob(payloadBase64));
      return decodedPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la autenticación');
      }

      const token = data.access_token;
      localStorage.setItem('token', token);

      // Decodificar el JWT para extraer el userId
      const payload = decodeToken(token);
      if (payload && payload._id) {
        localStorage.setItem('userId', payload._id);
        console.log('userId guardado en localStorage:', localStorage.getItem('userId'));
      } else {
        console.warn('userId no encontrado en el payload');
      }
      
      
      localStorage.setItem('username', formData.username);

      navigate('/');
    } catch (err) {
      setError(err.message);
      console.error('Auth error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="flex justify-center mb-8">
              <div className="bg-amber-100 p-1 rounded-xl">
                <button 
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    isLogin ? 'bg-white shadow-md text-amber-800' : 'text-amber-600'
                  }`}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button 
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    !isLogin ? 'bg-white shadow-md text-amber-800' : 'text-amber-600'
                  }`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>
            </div>
            
            <AuthForm isLogin={isLogin} onSubmit={handleSubmit} />
            
            <p className="text-center mt-6 text-amber-700">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
