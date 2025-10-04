'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api'; // Importamos nosso helper

export default function AdminSettingsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [form, setForm] = useState({ name: '', email: '' });
    const [senhaForm, setSenhaForm] = useState({
        current_password: '',
        new_password: '',
        password_confirmation: '',
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
        await fetchWithAuth('profile', {
          method: 'PATCH',
          body: JSON.stringify({ profile: form }),
        });
    
        alert('Perfil atualizado com sucesso!');
        router.refresh();
      } catch (err: any) {
        alert(err.message || 'Erro ao atualizar perfil');
      }
  }

  async function alterarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senhaForm.new_password !== senhaForm.password_confirmation) {
      alert('As novas senhas não conferem!');
      return;
    }
    try{
        await fetchWithAuth('profile/change_password', {
            method: 'POST',
            body: JSON.stringify(senhaForm),
          });

        alert('Senha atualizada com sucesso!');
        setSenhaForm({ current_password: '', new_password: '', password_confirmation: '' }); // Limpa o formulário
        router.refresh();
    } catch (err: any) {
        alert(err.message || 'Erro ao atualizar senha');
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Configurações da Conta</h1>

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

      <section>
        <h2 className="text-xl text-orange-700 font-semibold mb-2">Alterar Senha</h2>
        <form onSubmit={alterarSenha} className="text-neutral-300 space-y-4">
          <input
            type="password"
            name="current_password"
            placeholder="Senha atual"
            value={senhaForm.current_password}
            onChange={handleSenhaChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            name="new_password"
            placeholder="Nova senha"
            value={senhaForm.new_password}
            onChange={handleSenhaChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            name="password_confirmation"
            placeholder="Confirmar nova senha"
            value={senhaForm.password_confirmation}
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