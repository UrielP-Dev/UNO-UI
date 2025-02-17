import { Cat } from 'lucide-react';

const Header = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
          <Cat className="w-12 h-12 text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        UNO Cat
      </h1>
      <p className="text-amber-800 mt-2">The purr-fect card game</p>
    </div>
  );
};

export default Header;
