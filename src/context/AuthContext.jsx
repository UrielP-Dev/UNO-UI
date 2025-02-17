import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// Crear el contexto de autenticación
const AuthContext = createContext();

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("user") || null);
  const navigate = useNavigate();

  const login = (username) => {
    setUser(username);
    localStorage.setItem("user", username);
    navigate("/"); // Redirigir a la home después de iniciar sesión
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login"); // Redirigir a la página de inicio de sesión
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);
