const ErrorMessage = ({ error, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl max-w-md w-full mx-4">
      <div className="text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  </div>
);

export default ErrorMessage; 