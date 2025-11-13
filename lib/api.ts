// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

  // --- CORREÇÃO DO ERRO TS(2322) ---
  // Usamos o construtor `Headers` que sabe lidar com
  // RequestInit['headers'] (seja objeto, array, ou outro Headers)
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Só definimos 'Content-Type: application/json' se o corpo
  // NÃO for FormData e o usuário já não tiver definido um ('Content-Type').
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Se for FormData, nós propositalmente deletamos o Content-Type.
  // O navegador vai adicionar o 'multipart/form-data' correto 
  // com o 'boundary' (ex: WebKitFormBoundary...)
  if (options.body instanceof FormData) {
    headers.delete('Content-Type');
  }
  // --- FIM DA CORREÇÃO ---

  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers, // Passa o objeto Headers
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'Ocorreu um erro na resposta da API.' };
    }
    // Tenta pegar a mensagem de erro da API
    const errorMessage = errorData.error || (errorData.errors && Array.isArray(errorData.errors) ? errorData.errors.join(', ') : 'Ocorreu um erro na API');
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
};