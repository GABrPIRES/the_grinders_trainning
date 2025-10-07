'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function AlunoSettingsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    // Estado para os dados do User e do Aluno
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone_number: '',
        weight: '',
        height: '',
        objetivo: ''
    });

    const [senhaForm, setSenhaForm] = useState({
        current_password: '',
        new_password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            if (user) {
                try {
                    // Busca os dados completos do perfil, incluindo os dados do 'aluno'
                    const profileData = await fetchWithAuth('profile');
                    setForm({
                        name: profileData.name || '',
                        email: profileData.email || '',
                        phone_number: profileData.aluno?.phone_number || '',
                        weight: profileData.aluno?.weight || '',
                        height: profileData.aluno?.height || '',
                        objetivo: profileData.aluno?.objetivo || '',
                    });
                } catch (error) {
                    console.error("Erro ao buscar dados do perfil:", error);
                }
            }
        };
        fetchProfileData();
    }, [user]);

    if (loading) return <p className='text-neutral-800 p-6'>Carregando...</p>;
    if (!user) return <p className="p-6">Usuário não autenticado.</p>;

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
            router.refresh(); // Recarrega os dados do usuário no AuthContext
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
        try {
            await fetchWithAuth('profile/change_password', {
                method: 'POST',
                body: JSON.stringify(senhaForm),
            });
            alert('Senha atualizada com sucesso!');
            setSenhaForm({ current_password: '', new_password: '', password_confirmation: '' });
        } catch (err: any) {
            alert(err.message || 'Erro ao atualizar senha');
        }
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Minhas Configurações</h1>

            <section>
                <h2 className="text-xl text-red-700 font-semibold mb-2">Editar Perfil</h2>
                <form onSubmit={atualizarPerfil} className="space-y-4">
                    <input type="text" name="name" placeholder="Nome" value={form.name} onChange={handleChange} className="w-full border p-2 rounded text-neutral-600" />
                    <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded text-neutral-600" />
                    <input type="text" name="phone_number" placeholder="Telefone" value={form.phone_number} onChange={handleChange} className="w-full border p-2 rounded text-neutral-600" />
                    <input type="number" name="weight" placeholder="Peso (kg)" value={form.weight} onChange={handleChange} className="w-full border p-2 rounded text-neutral-600" />
                    <input type="number" name="height" placeholder="Altura (cm)" value={form.height} onChange={handleChange} className="w-full border p-2 rounded text-neutral-600" />
                    <textarea name="objetivo" placeholder="Meu Objetivo Principal" value={form.objetivo} onChange={handleChange} className="w-full border p-2 rounded text-neutral-600" rows={3}></textarea>
                    <button className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800">
                        Salvar Alterações
                    </button>
                </form>
            </section>

            <hr />

            <section>
                <h2 className="text-xl text-red-700 font-semibold mb-2">Alterar Senha</h2>
                <form onSubmit={alterarSenha} className="space-y-4">
                    <input type="password" name="current_password" placeholder="Senha atual" value={senhaForm.current_password} onChange={handleSenhaChange} className="w-full border p-2 rounded text-neutral-600" />
                    <input type="password" name="new_password" placeholder="Nova senha" value={senhaForm.new_password} onChange={handleSenhaChange} className="w-full border p-2 rounded text-neutral-600" />
                    <input type="password" name="password_confirmation" placeholder="Confirmar nova senha" value={senhaForm.password_confirmation} onChange={handleSenhaChange} className="w-full border p-2 rounded text-neutral-600" />
                    <button className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800">
                        Alterar Senha
                    </button>
                </form>
            </section>
        </div>
    );
}