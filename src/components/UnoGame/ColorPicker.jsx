const ColorPicker = ({ show, onSelectColor }) => {
  if (!show) return null;
  
  const colorOptions = [
    { name: 'red', label: 'Rojo', class: 'bg-red-600' },
    { name: 'blue', label: 'Azul', class: 'bg-blue-600' },
    { name: 'green', label: 'Verde', class: 'bg-green-600' },
    { name: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Selecciona un color</h3>
        <div className="grid grid-cols-2 gap-4">
          {colorOptions.map(color => (
            <button 
              key={color.name}
              onClick={() => onSelectColor(color.name)}
              className={`w-24 h-24 ${color.class} rounded-lg hover:ring-4 hover:ring-yellow-400 relative`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                {color.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
