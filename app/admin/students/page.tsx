'use client';

import { useEffect, useState } from 'react';

type Student = {
  id: string;
  name: string;
  email: string;
};

export default function AdminStudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

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
      <h2 className="text-2xl font-bold mb-4 text-neutral-800">Students cadastrados</h2>

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
            {students.map((student) => (
              <tr key={student.id} className="text-neutral-800 hover:bg-gray-100">
                <td className="p-2 border border-neutral-100">{student.name}</td>
                <td className="p-2 border border-neutral-100">{student.email}</td>
                <td className="p-2 border border-neutral-100 text-xs">{student.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
