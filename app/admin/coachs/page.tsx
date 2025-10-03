'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

type Coach = {
  id: string;
  name: string;
  email: string;
};

export default function AdminCoachListPage() {
  const router = useRouter();

  const [coachs, setCoachs] = useState<Coach[]>([]);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCoachs = async () => {
    setLoading(true);
    try {
      // A API Rails ainda não suporta paginação, então vamos ignorar 'page' e 'limit' por enquanto
      const params = new URLSearchParams({
        role: 'personal', // Filtro para trazer apenas coaches
        search,
      });

      // Usamos o fetchWithAuth para chamar o endpoint de usuários do Rails
      const data = await fetchWithAuth(`users?${params}`);

      setCoachs(data);
      // setTotal(data.total); // A API Rails ainda não retorna o total
    } catch (error) {
      console.error('Erro ao carregar coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachs();
  }, [search]); // Removido page e limit por enquanto

  // const totalPages = Math.ceil(total / limit); // Desativado temporariamente

  return (
    <div className="max-w-5xl mx-auto bg-white shadow p-6 rounded-md">
      <h2 className="text-1xl font-bold mb-4 text-neutral-800 flex justify-between items-center">
        Coachs cadastrados
        <button
          onClick={() => router.push(`/admin/coachs/create`)} // URL mais genérica
          className="text-red-600 hover:text-red-800 p-2 rounded-md border cursor-pointer border-red-600"
        >
          Adicionar Coach
        </button>
      </h2>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 text-neutral-500">
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-neutral-500 text-left">
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">E-mail</th>
              <th className="p-2 border">ID</th>
              <th className="p-2 border text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {coachs.map((coach) => (
              <tr key={coach.id} className="text-neutral-800 hover:bg-gray-100 text-sm">
                <td className="p-2 border border-neutral-100">{coach.name}</td>
                <td className="p-2 border border-neutral-100">{coach.email}</td>
                <td className="p-2 border border-neutral-100 text-xs">{coach.id}</td>
                <td className="p-2 border border-neutral-100 text-center">
                  <button
                    onClick={() => router.push(`/admin/coachs/${coach.id}/edit`)} // URL mais genérica
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginação removida temporariamente */}
    </div>
  );
}