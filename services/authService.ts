// services/authService.ts
import { fetchWithAuth } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login({ email, password }: { email: string; password: string }) {
  // Usamos fetch direto aqui pois login é público e não precisa das configs do fetchWithAuth ainda
  const res = await fetch(`${API_URL}/login`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // [IMPORTANTE] Para aceitar o Set-Cookie do backend
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao fazer login');
  }

  const data = await res.json();
  
  // [SEGURANÇA] NÃO salvamos mais nada no localStorage ou Cookies via JS.
  // O navegador já guardou o cookie HttpOnly.
  
  return data; 
}

export async function logout() {
  try {
      // Avisa o backend para "matar" o cookie
      await fetchWithAuth('logout', { method: 'DELETE' }); 
  } catch (e) {
      console.error("Erro ao fazer logout na API", e);
  }

  // Limpa o que sobrou no front e redireciona
  localStorage.removeItem('user');
  window.location.href = '/login';
}