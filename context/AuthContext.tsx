'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api'; // Usamos nosso helper de API

type User = {
  id: string;
  name: string;
  role: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // 1. Verifica se existe um token no localStorage
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // 2. Usa nosso helper para buscar o perfil na API Rails
        const userData = await fetchWithAuth('profile'); // Faz a chamada para GET /api/v1/profile
        setUser(userData); // 3. Define o usuário com os dados recebidos da API
      } catch (error) {
        console.error("Falha ao buscar usuário, limpando token:", error);
        setUser(null);
        localStorage.removeItem('jwt_token'); // Limpa o token inválido
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);