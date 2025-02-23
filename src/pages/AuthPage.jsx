import  { useState } from 'react';
import AuthForm from '../components/AuthForm';
import Card from '../components/Card';
import Header from '../components/Header';
 

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
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

      onLogin(data.access_token, formData.username);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-1/4 -right-4 w-32 h-32 bg-red-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-1/4 -left-4 w-40 h-40 bg-amber-200 rounded-full opacity-20 blur-xl"></div>
      </div>
      
      <div className="w-full max-w-md">
        <Card>
          <Header />
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Switch entre Login y Sign Up */}
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
  );
};

export default AuthPage;
