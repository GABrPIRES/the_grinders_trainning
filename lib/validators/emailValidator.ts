export const emailValidator = async (email: string) => {
  // Validação do formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Por favor, insira um e-mail válido.';
  }
  return ''; // Se tudo estiver certo, não retorna erro
};
