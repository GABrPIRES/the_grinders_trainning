import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login({ email, password }: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/login`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao fazer login');
  }

  const data = await res.json();

  // Salva o token no localStorage
  if (data.token) {
    localStorage.setItem('jwt_token', data.token);
    // Salva nos Cookies também para o Middleware funcionar
    Cookies.set('token', data.token, { expires: 7 }); 
    Cookies.set('role', data.user.role, { expires: 7 });
  }

  return data; 
}

export async function logout() {
  // 1. Limpa localStorage
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');

  // 2. Limpa os Cookies (ESSENCIAL para o Middleware não te deixar voltar)
  Cookies.remove('token');
  Cookies.remove('role');

  window.location.href = '/login';
}