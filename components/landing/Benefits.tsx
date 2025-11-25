"use client";
import { useState } from "react";
import { Calendar, FileSpreadsheet, BarChart3, MessageSquare, ListChecks, TrendingUp, Camera, Dumbbell } from "lucide-react";
import { motion } from "framer-motion"; // Adicionado

export default function Benefits() {
  const [activeTab, setActiveTab] = useState("coach");

  const coachBenefits = [
    { icon: Calendar, title: "Gestão de Blocos", description: "Crie e edite blocos de treino complexos com semanas e datas definidas." },
    { icon: FileSpreadsheet, title: "Importação Rápida", description: "Pare de digitar. Importe suas planilhas de Excel existentes diretamente para o app." },
    { icon: BarChart3, title: "Visão Completa", description: "Acompanhe o progresso de todos os seus alunos em um dashboard inteligente." },
    { icon: MessageSquare, title: "Feedback Rápido", description: "Receba dados de RPE, vídeos e métricas dos seus atletas em tempo real." }
  ];

  const athleteBenefits = [
    { icon: ListChecks, title: "Clareza Total", description: "Receba seu treino do dia de forma clara e objetiva. Sem confusão." },
    { icon: Dumbbell, title: "Registro Flexível", description: "Registre suas cargas em KG, LB ou RIR. O app cuida do resto." },
    { icon: TrendingUp, title: "Histórico de Progresso", description: "Veja seus recordes pessoais (PRs) subindo e acompanhe sua evolução em gráficos." },
    { icon: Camera, title: "Comunicação Direta", description: "Envie seus vídeos e RPEs diretamente para seu coach." }
  ];
  
  const gridContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Adiciona 0.1s de delay entre os itens
      },
    },
  };
  
  // Variante para cada item (card)
  const gridItem = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="benefits" className="py-24 bg-neutral-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Navegação das Abas (Revelação suave) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="p-1.5 bg-neutral-950 rounded-xl flex gap-2 border border-neutral-800">
            <button
              onClick={() => setActiveTab("coach")}
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
                activeTab === "coach"
                  ? "bg-red-700 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              Para Coaches
            </button>
            <button
              onClick={() => setActiveTab("athlete")}
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
                activeTab === "athlete"
                  ? "bg-red-700 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              Para Atletas
            </button>
          </div>
        </motion.div>

        {/* Conteúdo das Abas */}
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="text-center mb-12">
            <motion.h2 
              key={activeTab} // Chave para forçar a re-animação na troca de aba
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-4xl md:text-5xl font-black mb-4 text-white"
            >
              {activeTab === "coach" ? "Gestão Total." : "Menos Distração."}
              <span className="block text-red-700 mt-2">
                {activeTab === "coach" ? "Performance Máxima." : "Mais PRs."}
              </span>
            </motion.h2>
          </div>
          
          <motion.div 
            key={activeTab + "-content"} 
            initial="hidden"
            animate="show"
            variants={gridContainer} // Usa a variante de contêiner
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {(activeTab === "coach" ? coachBenefits : athleteBenefits).map((benefit, index) => (
              <motion.div 
                key={index} 
                variants={gridItem} // Usa a variante de item
                className="p-8 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-red-900 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/10 group"
              >
                <benefit.icon className="w-12 h-12 text-red-700 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-3 text-white">{benefit.title}</h3>
                <p className="text-neutral-400 text-lg leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}