'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [form, setForm] = useState({ name: '', email: '' });

    const [senhaForm, setSenhaForm] = useState({
        atual: '',
        nova: '',
        confirmar: '',
    });

    useEffect(() => {
        if (user) {
          setForm({
            name: user.name,
            email: user.email,
          });
        }
    }, [user]);

    if (loading) return <p className='text-neutral-800'>Carregando...</p>;
    if (!user) return <p>Usuário não autenticado.</p>;

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSenhaChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSenhaForm({ ...senhaForm, [e.target.name]: e.target.value });
  }

  async function atualizarPerfil(e: React.FormEvent) {
    e.preventDefault();
    try {
        const res = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        });
    
        if (!res.ok) {
          const erro = await res.json();
          alert(erro.error || 'Erro ao atualizar perfil');
          return;
        }
    
        alert('Perfil atualizado com sucesso!');
        router.refresh();
      } catch (error) {
        alert('Erro ao atualizar perfil');
        console.error(error);
      }
  }

  async function alterarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senhaForm.nova !== senhaForm.confirmar) {
      alert('Senhas não conferem!');
      return;
    }
    try{
        const res = await fetch('/api/users/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              atual: senhaForm.atual,
              nova: senhaForm.nova,
            }),
          });

        if (!res.ok) {
            const erro = await res.json();
            alert(erro.error || 'Erro ao atualizar senha');
            return;
        }
        alert('Senha atualizado com sucesso!');
        router.refresh();
    }catch (error) {
        alert('Erro ao atualizar senha');
        console.error(error);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Configurações da Conta</h1>

      {/* Editar perfil */}
      <section>
        <h2 className="text-xl text-orange-700 font-semibold mb-2">Editar Perfil</h2>
        <form onSubmit={atualizarPerfil} className="text-neutral-300 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nome"
            value={form.name}
            onChange={handleProfileChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleProfileChange}
            className="w-full border p-2 rounded"
          />
          <button className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800">
            Salvar Alterações
          </button>
        </form>
      </section>

      <hr />

      {/* Alterar senha */}
      <section>
        <h2 className="text-xl text-orange-700 font-semibold mb-2">Alterar Senha</h2>
        <form onSubmit={alterarSenha} className="text-neutral-300 space-y-4">
          <input
            type="password"
            name="atual"
            placeholder="Senha atual"
            value={senhaForm.atual}
            onChange={handleSenhaChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            name="nova"
            placeholder="Nova senha"
            value={senhaForm.nova}
            onChange={handleSenhaChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            name="confirmar"
            placeholder="Confirmar nova senha"
            value={senhaForm.confirmar}
            onChange={handleSenhaChange}
            className="w-full border p-2 rounded"
          />
          <button className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800">
            Alterar Senha
          </button>
        </form>
      </section>
    </div>
  );
}