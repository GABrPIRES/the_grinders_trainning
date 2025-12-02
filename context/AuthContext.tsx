// context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';

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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Evita check em páginas públicas para economizar requisições (opcional)
      if (pathname === '/login' || pathname === '/') {
          setLoading(false);
          return;
      }

      try {
        // Tenta buscar perfil. Se o cookie HttpOnly estiver lá e válido, funciona.
        const userData = await fetchWithAuth('profile'); 
        setUser(userData);
      } catch (error) {
        // Se der erro (401), não temos usuário
        setUser(null);
        // Se estiver em rota protegida, o middleware ou o componente vai redirecionar
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);