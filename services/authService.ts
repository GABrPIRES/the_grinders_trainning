export async function login({ email, password }: { email: string; password: string }) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Erro ao fazer login");
    }
  
    return res.json(); // dados do usuário
  }
  
  export async function logout() {
    const res = await fetch("/api/auth/logout", {
      method: "POST"
    });
  
    if (!res.ok) {
      throw new Error("Erro ao fazer logout");
    }
  }