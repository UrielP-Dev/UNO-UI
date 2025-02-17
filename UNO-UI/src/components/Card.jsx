// src/components/Card.jsx
import React from 'react';

const Card = ({ children }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100 w-full max-w-md">
      {children}
    </div>
  );
};

export default Card;
