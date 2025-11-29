"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { 
  ArrowLeft, User, Mail, Phone, Calendar, Weight, Ruler, 
  Activity, AlertCircle, Target, Clock, Dumbbell, Trophy, Edit
} from "lucide-react";

interface StudentDetails {
  id: string;
  birth_date: string;
  phone_number: string;
  weight: number;
  height: number;
  objetivo: string;
  lesao: string;
  restricao_medica: string;
  treinos_semana: number;
  tempo_treino: string;
  horario_treino: string;
  pr_supino: number;
  pr_terra: number;
  pr_agachamento: number;
  user: { name: string; email: string; };
}

export default function StudentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      try {
        const data = await fetchWithAuth(`alunos/${id}`);
        setStudent(data);
      } catch (error) {
        console.error("Erro ao carregar aluno", error);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-neutral-500">Carregando perfil...</div>;
  if (!student) return <div className="p-8 text-center text-red-500">Aluno não encontrado.</div>;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return "-";
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age + " anos";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-neutral-800">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/coach/students')} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{student.user.name}</h1>
            <div className="flex items-center gap-2 text-neutral-500 mt-1">
              <Mail size={16} />
              <span>{student.user.email}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
             <button 
                onClick={() => router.push(`/coach/payments/${student.id}`)}
                className="px-4 py-2 bg-white border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
             >
                Financeiro
             </button>
             
             {/* BOTÃO DE EDITAR: Leva para a outra página */}
             <button 
                onClick={() => router.push(`/coach/students/${student.id}/edit`)}
                className="px-4 py-2 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 transition-colors flex items-center gap-2"
             >
                <Edit size={16} /> Editar Conta
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARDS VISUAIS (Igual você gostou) */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-700">
            <User size={20} className="text-red-700" /> Dados Pessoais
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-neutral-50 pb-2">
              <span className="text-neutral-500 flex items-center gap-2"><Phone size={16}/> Telefone</span>
              <span className="font-medium">{student.phone_number || "-"}</span>
            </li>
            <li className="flex justify-between border-b border-neutral-50 pb-2">
              <span className="text-neutral-500 flex items-center gap-2"><Calendar size={16}/> Nascimento</span>
              <span className="font-medium">{formatDate(student.birth_date)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-neutral-500 flex items-center gap-2"><Activity size={16}/> Idade</span>
              <span className="font-medium">{calculateAge(student.birth_date)}</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-700">
            <Activity size={20} className="text-red-700" /> Corpo & Saúde
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
             <div className="bg-neutral-50 p-3 rounded-lg text-center">
                <p className="text-sm text-neutral-500">Peso</p>
                <p className="font-bold text-lg">{student.weight ? `${student.weight} kg` : "-"}</p>
             </div>
             <div className="bg-neutral-50 p-3 rounded-lg text-center">
                <p className="text-sm text-neutral-500">Altura</p>
                <p className="font-bold text-lg">{student.height ? `${student.height} m` : "-"}</p>
             </div>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Lesões / Restrições</p>
            <p className="text-sm font-medium text-neutral-800">{student.lesao || student.restricao_medica || "Nenhuma relatada"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
           <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-700">
            <Dumbbell size={20} className="text-red-700" /> Treino
          </h2>
           <ul className="space-y-2 text-sm">
             <li><span className="text-neutral-500">Objetivo:</span> <span className="font-semibold">{student.objetivo || "-"}</span></li>
             <li><span className="text-neutral-500">Frequência:</span> <span className="font-semibold">{student.treinos_semana ? `${student.treinos_semana}x/sem` : "-"}</span></li>
             <li><span className="text-neutral-500">Horário:</span> <span className="font-semibold">{student.horario_treino || "-"}</span></li>
           </ul>
        </div>
        
        {/* PRs Card */}
        <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
           <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-700"><Trophy size={20} className="text-yellow-500"/> Recordes Pessoais</h2>
           <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-neutral-50 p-4 rounded-lg">
                 <p className="text-xs uppercase text-neutral-500 font-bold">Agachamento</p>
                 <p className="text-2xl font-black text-neutral-800">{student.pr_agachamento || 0} kg</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                 <p className="text-xs uppercase text-neutral-500 font-bold">Supino</p>
                 <p className="text-2xl font-black text-neutral-800">{student.pr_supino || 0} kg</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                 <p className="text-xs uppercase text-neutral-500 font-bold">Terra</p>
                 <p className="text-2xl font-black text-neutral-800">{student.pr_terra || 0} kg</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}