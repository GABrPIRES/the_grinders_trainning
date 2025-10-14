"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function CreateTrainingBlockPage() {
  const { id: alunoId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    weeks_duration: "5", // Valor padrão
    start_date: "",
    end_date: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        training_block: {
          title: formData.title,
          weeks_duration: parseInt(formData.weeks_duration, 10),
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        },
      };

      await fetchWithAuth(`alunos/${alunoId}/training_blocks`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Bloco de treino criado com sucesso!");
      router.push(`/coach/treinos/${alunoId}`); // Volta para a lista de blocos
      router.refresh(); // Força a atualização dos dados na página anterior
    } catch (err: any) {
      setError(err.message || "Erro ao criar o bloco de treino.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md text-neutral-800">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para os blocos
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Criar Novo Bloco de Treino</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700">Título do Bloco</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            placeholder="Ex: Bloco de Hipertrofia (Janeiro)"
            required
          />
        </div>
        <div>
          <label htmlFor="weeks_duration" className="block text-sm font-medium text-neutral-700">Duração (semanas)</label>
          <input
            id="weeks_duration"
            type="number"
            name="weeks_duration"
            value={formData.weeks_duration}
            onChange={handleChange}
            className="mt-1 w-full border p-2 rounded text-neutral-600"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-neutral-700">Data de Início (Opcional)</label>
                <input id="start_date" type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-neutral-600"/>
            </div>
            <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-neutral-700">Data Final (Opcional)</label>
                <input id="end_date" type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="mt-1 w-full border p-2 rounded text-neutral-600"/>
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-700 text-white p-2 rounded cursor-pointer hover:bg-red-800 disabled:bg-red-400"
        >
          {loading ? 'Salvando...' : 'Salvar Bloco'}
        </button>
      </form>
    </div>
  );
}