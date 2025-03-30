'use client';

import { useEffect, useState } from 'react';

type Coach = {
  id: string;
  name: string;
  email: string;
};

export default function AdminCoachListPage() {
  const [coachs, setCoachs] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

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
      <h2 className="text-2xl font-bold mb-4 text-neutral-800">Coachs cadastrados</h2>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-neutral-500 text-left">
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">E-mail</th>
              <th className="p-2 border">ID</th>
            </tr>
          </thead>
          <tbody>
            {coachs.map((coach) => (
              <tr key={coach.id} className="text-neutral-800 hover:bg-gray-100">
                <td className="p-2 border border-neutral-100">{coach.name}</td>
                <td className="p-2 border border-neutral-100">{coach.email}</td>
                <td className="p-2 border border-neutral-100 text-xs">{coach.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
