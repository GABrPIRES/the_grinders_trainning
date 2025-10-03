// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

  // CORREÇÃO: Definimos o tipo do cabeçalho de forma explícita
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Se o options.headers existir, mesclamos com o nosso
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'Ocorreu um erro na resposta da API.' };
    }
    throw new Error(errorData.error || 'Ocorreu um erro na API');
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
};