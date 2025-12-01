"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { 
  ArrowLeft, User, Mail, Phone, Lock, 
  CreditCard, Save, Loader2, GraduationCap 
} from 'lucide-react';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.br';

interface Plan {
  id: string;
  name: string;
}

export default function AddStudentPage() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    planoId: '',
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await fetchWithAuth('planos');
        setPlans(data);
      } catch (err) {
        console.error("Falha ao carregar planos:", err);
      }
    };
    fetchPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await fetchWithAuth('alunos', {
        method: 'POST',
        body: JSON.stringify({
          aluno: {
            name: student.name,
            email: student.email,
            password: student.password,
            phone_number: student.phoneNumber,
            plano_id: student.planoId || null,
          },
        }),
      });

      alert('Aluno adicionado com sucesso!');
      router.push('/coach/students');
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar aluno');
    } finally {
      setLoading(false);
    }
  };

  // Classes comuns para inputs
  const inputClassName = "w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-neutral-700";

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Novo Aluno</h1>
          <p className="text-neutral-500 text-sm">Cadastre um aluno para começar a gerenciar seus treinos.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100 flex items-center gap-2">
          <span className="font-bold">Erro:</span> {error}
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-neutral-200 shadow-sm space-y-6">
        
        <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 border-b border-neutral-100 pb-2 mb-4">
               <GraduationCap size={20} className="text-red-700"/> Dados Pessoais
            </h2>

            {/* Nome */}
            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Nome Completo</label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={student.name}
                    onChange={handleChange}
                    className={inputClassName}
                    placeholder="Ex: João da Silva"
                    required
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">Email</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={student.email}
                        onChange={handleChange}
                        className={inputClassName}
                        placeholder="aluno@email.com"
                        required
                      />
                   </div>
                </div>

                {/* Telefone */}
                <div>
                   <label className="block text-sm font-medium mb-1 text-neutral-600">WhatsApp / Telefone</label>
                   <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <Cleave
                        name="phoneNumber"
                        value={student.phoneNumber}
                        onChange={handleChange}
                        className={inputClassName}
                        placeholder="(11) 99999-9999"
                        options={{ phone: true, phoneRegionCode: 'BR' }}
                        required
                      />
                   </div>
                </div>
            </div>

            {/* Senha */}
            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Senha de Acesso</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={student.password}
                    onChange={handleChange}
                    className={inputClassName}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
               </div>
               <p className="text-xs text-neutral-400 mt-1">O aluno poderá alterar esta senha no primeiro login.</p>
            </div>
        </div>

        {/* Financeiro / Plano */}
        <div className="pt-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 border-b border-neutral-100 pb-2 mb-4">
               <CreditCard size={20} className="text-red-700"/> Assinatura
            </h2>
            
            <div>
               <label className="block text-sm font-medium mb-1 text-neutral-600">Selecionar Plano</label>
               <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <select
                    name="planoId"
                    value={student.planoId}
                    onChange={handleChange}
                    className={`${inputClassName} bg-white appearance-none cursor-pointer`}
                  >
                    <option value="">Sem plano (Apenas cadastro)</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
               </div>
               <p className="text-xs text-neutral-400 mt-1">
                 Selecionar um plano irá gerar uma assinatura ativa imediatamente.
               </p>
            </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 w-full md:w-auto justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Salvando..." : "Cadastrar Aluno"}
          </button>
        </div>

      </form>
    </div>
  );
}