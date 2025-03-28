'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [erro, setErro] = useState("");
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = await login(form);
      
      // Redireciona com base na role do usuário
      if (user.role === "admin") router.push("/admin");
      if (user.role === "personal") router.push("/coach");
      if (user.role === "aluno") router.push("/aluno");
    } catch (err: any) {
      setErro(err.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={handleChange}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Entrar</button>
      </form>
      {erro && <p className="mt-4 text-red-600 text-sm">{erro}</p>}
    </div>
  );
}
