'use client';

import { useAuth } from '@/context/AuthContext';

export default function CoachProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-gray-600">Carregando perfil...</p>;
  if (!user) return <p className="text-red-500">Usuário não autenticado.</p>;

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Meu Perfil</h2>

      <div className="space-y-2 text-gray-700">
        <p><strong>Nome:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email || 'Não disponível'}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>ID:</strong> {user.id}</p>
      </div>
    </div>
  );
}
