// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // [SEGURANÇA] Não pegamos mais token do localStorage. O Cookie HttpOnly vai automático.
  
  const headers = new Headers(options.headers);

  // Define JSON apenas se não for FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (options.body instanceof FormData) {
    headers.delete('Content-Type');
  }

  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // [IMPORTANTE] Isso faz o navegador enviar o Cookie HttpOnly
  });

  if (response.status === 401) {
    // Se der 401, o cookie expirou ou é inválido.
    // Podemos redirecionar para login ou apenas lançar erro para o Context lidar.
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
       // Opcional: window.location.href = '/login'; 
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'Ocorreu um erro na resposta da API.' };
    }
    const errorMessage = errorData.error || (errorData.errors && Array.isArray(errorData.errors) ? errorData.errors.join(', ') : 'Ocorreu um erro na API');
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
};