'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react'; // Ícone de lápis

type Student = {
  id: string;
  name: string;
  email: string;
};

export default function AdminStudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/admin/students');
        const data = await res.json();
        setStudents(data.students);
      } catch (error) {
        console.error('Erro ao carregar students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-md">
      <h2 className="text-1xl font-bold mb-4 text-neutral-800 flex justify-between items-center">
        Students cadastrados
        {/* Botão de editar na parte superior direita */}
        <button
          onClick={() => router.push(`/admin/students/create`)} // Ajuste para criar um coach, caso deseje
          className="text-red-600 hover:text-red-800 p-2 rounded-md cursor-pointer border border-red-600"
        >
          Adicionar Student
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
            {students.map((student) => (
              <tr key={student.id} className="text-neutral-800 hover:bg-gray-100">
                <td className="p-2 border border-neutral-100">{student.name}</td>
                <td className="p-2 border border-neutral-100">{student.email}</td>
                <td className="p-2 border border-neutral-100 text-xs">{student.id}</td>
                <td className="p-2 border border-neutral-100 text-center">
                  {/* Botão de editar */}
                  <button
                    onClick={() => router.push(`/admin/students/${student.id}/edit`)}
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
