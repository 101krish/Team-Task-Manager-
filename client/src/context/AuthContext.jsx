import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("taskflow_user"));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("taskflow_token"));
  const [user, setUser] = useState(storedUser);

  const persistSession = (payload) => {
    localStorage.setItem("taskflow_token", payload.token);
    localStorage.setItem("taskflow_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const updateUser = (userData) => {
    localStorage.setItem("taskflow_user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    persistSession(response.data.data);
    return response.data.data;
  };

  const register = async (details) => {
    const response = await api.post("/auth/register", details);
    persistSession(response.data.data);
    return response.data.data;
  };

  const logout = () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      updateUser
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
