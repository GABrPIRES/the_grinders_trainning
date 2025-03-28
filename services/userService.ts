export async function criarUsuario(data: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "personal" | "aluno";
  }) {
    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erro ao criar usuário");
    }
  
    return res.json();
  }
  