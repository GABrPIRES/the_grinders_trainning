"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { fetchWithAuth } from "@/lib/api";
import { ChevronDown, Search, Filter, ArrowLeft } from "lucide-react";

interface Treino { id: string; name: string; duration_time: number; day: string; exercicios: any[]; }
interface AlunoDetails { user: { name: string; }; pagamento: { vencimento: string | null; status: string | null; }; plano: { nome: string | null; }; treino_info: { proximo_treino: string | null; ultima_atualizacao: string | null; }; }

export default function StudentWorkoutsPage() {
  const { id: alunoId } = useParams();
  const router = useRouter();
  
  const [allWorkouts, setAllWorkouts] = useState<Treino[]>([]);
  const [aluno, setAluno] = useState<AlunoDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // MELHORIA 2: Estados para a busca com "debounce"
  const [searchTerm, setSearchTerm] = useState(''); // Termo que vai para a API
  const [inputValue, setInputValue] = useState(''); // Valor imediato do input

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isWeekSectionOpen, setWeekSectionOpen] = useState(true);
  
  // MELHORIA 3: Estado para o menu de filtros
  const [showFilters, setShowFilters] = useState(false);

  // MELHORIA 2: Efeito para aplicar o "debounce" na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500); // Espera 500ms após o usuário parar de digitar

    return () => {
      clearTimeout(timer); // Limpa o timer se o usuário digitar novamente
    };
  }, [inputValue]);


  useEffect(() => {
    if (!alunoId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!aluno) { // Busca os detalhes do aluno apenas na primeira vez
            const alunoData = await fetchWithAuth(`alunos/${alunoId}`);
            setAluno(alunoData);
        }
        
        const params = new URLSearchParams({
          aluno_id: alunoId as string,
          search: searchTerm, // Usa o termo com debounce
          start_date: startDate,
          end_date: endDate,
          sort_order: sortOrder,
        });
        const treinosData = await fetchWithAuth(`treinos?${params}`);
        setAllWorkouts(treinosData);

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [alunoId, searchTerm, startDate, endDate, sortOrder]);

  const weeklyWorkouts = useMemo(() => {
    // 1. Pega a data de hoje e a converte para o início do dia em UTC.
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // 2. Calcula o início (Segunda) e o fim (Domingo) da semana, tudo em UTC.
    const dayOfWeekUTC = todayUTC.getUTCDay(); // 0 (Dom) a 6 (Sáb)
    const offsetToMonday = dayOfWeekUTC === 0 ? -6 : 1 - dayOfWeekUTC;
    
    const startOfWeekUTC = new Date(todayUTC);
    startOfWeekUTC.setUTCDate(todayUTC.getUTCDate() + offsetToMonday);
    
    const endOfWeekUTC = new Date(startOfWeekUTC);
    endOfWeekUTC.setUTCDate(startOfWeekUTC.getUTCDate() + 6);

    // 3. Filtra os treinos, comparando as datas em UTC.
    return allWorkouts.filter(t => {
      // A data "YYYY-MM-DD" do treino é naturalmente interpretada como UTC.
      const workoutDate = new Date(t.day);
      return workoutDate >= startOfWeekUTC && workoutDate <= endOfWeekUTC;
    });
  }, [allWorkouts]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-neutral-800">
      <div className="border-b pb-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} />
          Voltar para os alunos
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Treinos Aluno: {aluno?.user.name || ''}</h1>
        <button
          onClick={() => router.push(`/coach/treinos/${alunoId}/create`)}
          className="bg-red-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-800"
        >
          Criar treino
        </button>
      </div>

      <div className="mb-4 bg-white p-4 rounded border">
        {loading ? <p>Carregando detalhes...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div><span className="font-semibold">Plano:</span> {aluno?.plano.nome || '-'}</div>
            <div><span className="font-semibold">Status:</span> <span className={aluno?.pagamento.status === 'ativo' ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>{aluno?.pagamento.status || '-'}</span></div>
            {/* --- CORREÇÃO AQUI --- */}
            <div><span className="font-semibold">Vencimento:</span> {formatDate(aluno?.pagamento.vencimento ?? null)}</div>
            <div><span className="font-semibold">Última Atualização:</span> {formatDate(aluno?.treino_info.ultima_atualizacao ?? null)}</div>
          </div>
        )}
      </div>

      <div className="mb-6 border rounded-lg bg-white shadow-sm">
        <button onClick={() => setWeekSectionOpen(!isWeekSectionOpen)} className="w-full flex justify-between items-center p-4 font-bold text-lg">
          Treinos da Semana ({weeklyWorkouts.length})
          <ChevronDown className={`transition-transform ${isWeekSectionOpen ? 'rotate-180' : ''}`} />
        </button>
        {isWeekSectionOpen && (
          <div className="p-4 border-t">
            {weeklyWorkouts.length > 0 ? (
              <ul className="space-y-3">{weeklyWorkouts.map(treino => <WorkoutListItem key={treino.id} treino={treino} alunoId={alunoId as string} />)}</ul>
            ) : <p className="text-sm text-neutral-500">Nenhum treino agendado para esta semana.</p>}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Histórico de Treinos</h2>
        
        {/* MELHORIA 3: Menu de Filtros Retrátil */}
        <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
                <input type="text" placeholder="Buscar por nome do treino..." value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full border p-2 rounded" />
                <button onClick={() => setShowFilters(!showFilters)} className="ml-2 p-2 border rounded bg-white hover:bg-gray-100">
                    <Filter size={20} />
                </button>
            </div>
            
            {showFilters && (
                <div className="mt-4 space-y-4 border-t pt-4">
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full border p-2 rounded">
                      <option value="desc">Mais recentes primeiro</option>
                      <option value="asc">Mais antigos primeiro</option>
                    </select>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">De:</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border p-2 rounded mt-1" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Até:</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border p-2 rounded mt-1" />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {loading ? <p>Carregando treinos...</p> : (
          <ul className="space-y-3">
            {allWorkouts.map(treino => <WorkoutListItem key={treino.id} treino={treino} alunoId={alunoId as string} />)}
          </ul>
        )}
      </div>
    </div>
  );
}

const WorkoutListItem = ({ treino, alunoId }: { treino: Treino, alunoId: string }) => {
  const router = useRouter();
  return (
    <li className="bg-white border rounded p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{treino.name}</h3>
          <p className="text-sm text-neutral-600">
            {/* --- CORREÇÃO AQUI --- */}
            {new Date(treino.day).toLocaleDateString("pt-BR", { timeZone: 'UTC' })} - {treino.exercicios.length} exercícios
          </p>
        </div>
        <button onClick={() => router.push(`/coach/treinos/${alunoId}/${treino.id}`)} className="text-sm text-red-700 hover:underline">Ver treino</button>
      </div>
    </li>
  );
};
