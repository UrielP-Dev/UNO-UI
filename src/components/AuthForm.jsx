import { PawPrint } from 'lucide-react';

const AuthForm = ({ isLogin, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      username: e.target.username.value,
      password: e.target.password.value,
    };
    
    if (!isLogin) {
      formData.email = e.target.email.value;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div className="space-y-2">
        <label className="block text-amber-800 font-medium">Username</label>
        <input 
          type="text"
          name="username"
          className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none transition-colors bg-white/80"
          placeholder="CoolCat123"
        />
      </div>
      
      {!isLogin && (
        <div className="space-y-2">
          <label className="block text-amber-800 font-medium">Email</label>
          <input 
            type="email"
            name="email"
            className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none transition-colors bg-white/80"
            placeholder="cat@email.com"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <label className="block text-amber-800 font-medium">Password</label>
        <input 
          type="password"
          name="password"
          className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none transition-colors bg-white/80"
          placeholder="••••••••"
        />
      </div>
      <button 
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-xl
          hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
          shadow-lg"
      >
        {isLogin ? 'Login' : 'Sign Up'} <PawPrint className="inline-block ml-2 w-5 h-5" />
      </button>
    </form>
  );
};

export default AuthForm;
