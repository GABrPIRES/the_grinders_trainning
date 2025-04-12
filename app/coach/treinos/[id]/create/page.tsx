"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateWorkoutPage() {
  const { id } = useParams(); // id do aluno
  const router = useRouter();

  const [name, setName] = useState("");
  const [durationTime, setDurationTime] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`/api/coach/treinos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alunoId: id,
          name,
          durationTime: parseInt(durationTime),
          day,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar treino");
        return;
      }

      router.push(`/coach/treinos/${id}`);
    } catch (err) {
      setError("Erro na conexão");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6 text-neutral-800">Criar Treino</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-neutral-700">
        <input
          type="text"
          placeholder="Nome do treino"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Duração em minutos"
          className="w-full border p-2 rounded"
          value={durationTime}
          onChange={(e) => setDurationTime(e.target.value)}
          required
        />

        <input
          type="date"
          className="w-full border p-2 rounded"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-red-700 text-white py-2 rounded hover:bg-red-800"
        >
          Salvar treino
        </button>
      </form>
    </div>
  );
}