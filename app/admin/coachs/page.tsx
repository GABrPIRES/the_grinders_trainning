'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react'; // Ícone de lápis

type Coach = {
  id: string;
  name: string;
  email: string;
};

export default function AdminCoachListPage() {
  const [coachs, setCoachs] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCoachs = async () => {
      try {
        const res = await fetch('/api/admin/coachs');
        const data = await res.json();
        setCoachs(data.coachs);
      } catch (error) {
        console.error('Erro ao carregar coachs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-md">
      <h2 className="text-1xl font-bold mb-4 text-neutral-800 flex justify-between items-center">
        Coachs cadastrados
        {/* Botão de editar na parte superior direita */}
        <button
          onClick={() => router.push(`/admin/coachs/create`)} // Ajuste para criar um coach, caso deseje
          className="text-red-600 hover:text-red-800 p-2 rounded-md cursor-pointer border border-red-600"
        >
          Adicionar Coach
        </button>
      </h2>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-neutral-500 text-left">
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">E-mail</th>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {coachs.map((coach) => (
              <tr key={coach.id} className="text-neutral-800 hover:bg-gray-100">
                <td className="p-2 border border-neutral-100">{coach.name}</td>
                <td className="p-2 border border-neutral-100">{coach.email}</td>
                <td className="p-2 border border-neutral-100 text-xs">{coach.id}</td>
                <td className="p-2 border border-neutral-100 text-center">
                  {/* Botão de editar */}
                  <button
                    onClick={() => router.push(`/admin/coachs/${coach.id}/edit`)}
                    className="text-red-600 cursor-pointer hover:text-red-800"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
