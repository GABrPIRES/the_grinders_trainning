'use client';

import { useState } from "react";
import { criarUsuario } from "@/services/userService";

export default function CriarUsuarioPage() {
    const [form, setForm] = useState<{name: string; email: string; password: string; role: "personal" | "aluno" | "admin";}>({
        name: '',
        email: '',
        password: '',
        role: 'aluno', // Coloque um valor padrão válido aqui
    });
    

  const [mensagem, setMensagem] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await criarUsuario(form);
      setMensagem("Usuário criado com sucesso!");
      setForm({ name: "", email: "", password: "", role: "aluno" });
    } catch (err: any) {
      setMensagem("Erro: " + err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Criar Usuário</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Nome" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="password" name="password" placeholder="Senha" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" />

        <select name="role" value={form.role} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="admin">Admin</option>
          <option value="personal">Coach</option>
          <option value="aluno">Aluno</option>
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Criar</button>
      </form>

      {mensagem && <p className="mt-4 text-center text-sm text-gray-700">{mensagem}</p>}
    </div>
  );
}
