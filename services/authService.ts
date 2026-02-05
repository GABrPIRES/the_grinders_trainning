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

export async function signup(data: any) {
  const payload = {
    user: {
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    },
    phone_number: data.phone_number,
    coach_code: data.coach_code,
  };

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    // Tenta pegar erro específico ou array de erros
    const msg = error.error || (error.errors ? error.errors.join(', ') : 'Erro ao realizar cadastro');
    throw new Error(msg);
  }

  return res.json();
}

export async function verifyEmail(token: string) {
  const res = await fetch(`${API_URL}/auth/verify_email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Token inválido ou expirado');
  }

  return res.json();
}