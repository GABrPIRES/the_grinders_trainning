// services/authService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login({ email, password }: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/login`, { // 1. URL atualizada
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // 2. Corpo da requisição está correto (sem o objeto 'user' aninhado)
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erro ao fazer login');
  }

  const data = await res.json();

  // 3. Salva o token no localStorage
  if (data.token) {
    localStorage.setItem('jwt_token', data.token);
  }

  return data; // Retorna os dados completos (incluindo o user)
}

export async function logout() {
  // 4. Ação de logout agora é apenas remover o token do localStorage
  localStorage.removeItem('jwt_token');
  // Não precisamos mais de uma chamada de API para logout
  return Promise.resolve();
}