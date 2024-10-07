import React, { createContext, useState, useContext } from 'react';

// Crea el contexto
const CardContext = createContext();

// Hook para usar el contexto fácilmente
export const useCard = () => {
  return useContext(CardContext);
};

// Proveedor del contexto para envolver la app
export const CardProvider = ({ children }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <CardContext.Provider value={{ selectedCard, setSelectedCard }}>
      {children}
    </CardContext.Provider>
  );
};
